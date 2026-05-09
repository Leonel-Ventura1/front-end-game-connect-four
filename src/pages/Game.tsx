import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GameBoard } from '../components/GameBoard.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { Chat } from '../components/Chat.js';


import { Room, GameState, Message } from '../types/index.js';

import { apiClient } from '../services/api.js';
import { wsService } from '../services/websocket.js';

import { useAuthStore } from '../store/auth.js';
import { Loader } from '@/components/Loader.js';

const ROWS = 6;
const COLS = 7;


const EMPTY_BOARD: (string | null)[][] = Array(ROWS)
  .fill(null)
  .map(() => Array(COLS).fill(null));

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [startingGame, setStartingGame] = useState(false);

  const listenersSetup = useRef(false);
  const [showWinnerModal, setShowWinnerModal] = useState(true);

  const getEmptyRow = (
    board: (string | null)[][],
    col: number
  ): number => {
    if (col < 0 || col >= COLS) return -1;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row] && !board[row][col]) {
        return row;
      }
    }

    return -1;
  };


  useEffect(() => {
    if (game?.status === 'playing') {
      setShowWinnerModal(true);
    }
  }, [game?.status]);


  const countConsecutive = (
    board: (string | null)[][],
    row: number,
    col: number,
    rowDir: number,
    colDir: number
  ): number => {
    let count = 0;

    const player = board[row][col];

    let r = row + rowDir;
    let c = col + colDir;

    while (
      r >= 0 &&
      r < ROWS &&
      c >= 0 &&
      c < COLS &&
      board[r]?.[c] === player
    ) {
      count++;

      r += rowDir;
      c += colDir;
    }

    return count;
  };

  const checkDirection = (
    board: (string | null)[][],
    row: number,
    col: number,
    rowDir: number,
    colDir: number
  ): boolean => {
    let total = 1;

    total += countConsecutive(
      board,
      row,
      col,
      rowDir,
      colDir
    );

    total += countConsecutive(
      board,
      row,
      col,
      -rowDir,
      -colDir
    );

    return total >= 4;
  };


  const checkWinner = (
    board: (string | null)[][],
    row: number,
    col: number
  ): boolean => {
    const playerColor = board[row]?.[col];
    if (!playerColor) return false;

    return (
      checkDirection(board, row, col, 0, 1) ||
      checkDirection(board, row, col, 1, 0) ||
      checkDirection(board, row, col, 1, 1) ||
      checkDirection(board, row, col, 1, -1)
    );
  };



  useEffect(() => {
    if (!token || !roomId || listenersSetup.current) return;

    const setupListeners = async () => {
      try {
        if (!wsService.isConnected()) {
          await wsService.connect(token);
        }


        wsService.onGameStarted((updatedGame) => {
          setGame(updatedGame);
        });


        wsService.onGameUpdated((updatedGame) => {
         
          setGame(updatedGame);
        });

    
        wsService.onGameEnded((updatedGame) => {
          setGame(updatedGame);
        });


        wsService.onNewMessage((message) => {
          setMessages((prev) => [...prev, message]);
        });

        wsService.onUserJoined(async () => {

          try {
            const roomData = await apiClient.getRoomById(roomId);
            setRoom(roomData);

            if (roomData.game) {
              setGame(roomData.game);
            }
          } catch (err) {
            console.error('Erro ao atualizar sala:', err);
          }
        });

        listenersSetup.current = true;
      } catch (err) {
        console.error('Erro ao configurar listeners:', err);
      }
    };

    setupListeners();

    return () => {
      listenersSetup.current = false;
      wsService.removeAllListeners?.();
    };
  }, [token, roomId]);


  useEffect(() => {
    if (!roomId || !token) return;
setLoading(true);
    const loadData = async () => {
      try {
    

        const roomData = await apiClient.getRoomById(roomId);
        setRoom(roomData);

        if (roomData.game) {
          setGame(roomData.game);
        }

        const msgs = await apiClient.getRoomMessages(roomId);
        setMessages(msgs);

        if (wsService.isConnected()) {
          await wsService.joinRoom(roomId);
        }

        setError('');
      } catch (err: any) {
        setError('Falha ao carregar dados do jogo');
      } finally {
      setLoading(false);
      }
    };

    loadData();

    return () => {
      if (roomId) {
        wsService.leaveRoom(roomId);
      }
    };
  }, [roomId, token]);




  const canStartGame = !!room?.player1 && !!room?.player2;


  const isRoomHost = room?.host?.id === user?.id;


  const isCurrentPlayer = game
    ? game.player1Id === user?.id || game.player2Id === user?.id
    : room?.player1?.id === user?.id ||
    room?.player2?.id === user?.id;


  const isCurrentPlayerTurn = (): boolean => {
    if (!game || !user) return false;

    const isPlayer1 = game.player1Id === user.id;
    const isPlayer2 = game.player2Id === user.id;

    if (!isPlayer1 && !isPlayer2) return false;

    const isPlayer1Turn = game.currentPlayer === 'player1';

    return (isPlayer1 && isPlayer1Turn) || (isPlayer2 && !isPlayer1Turn);
  };


  const isBoardBlocked = (): boolean => {

    if (!game) return true;


    if (game.status !== 'playing') return true;


    if (!isCurrentPlayerTurn()) return true;

    return false;
  };


  const handleMove = async (column: number) => {

    if (!game || !user) {
      setError('Erro: jogo não carregado');
      return;
    }

    if (!isCurrentPlayerTurn()) {
      setError('Não é o seu turno');
      return;
    }

    if (game.status !== 'playing') {
      setError('Jogo não está a decorrer');
      return;
    }

    try {

      if (column < 0 || column >= COLS) {
        setError('Coluna inválida');
        return;
      }

      const boardCopy = game.board.map((row) => [...row]);
      const row = getEmptyRow(boardCopy, column);

      if (row === -1) {
        setError(' Esta coluna está cheia');
        return;
      }
     
      const currentDisc =
        game.currentPlayer === 'player1' ? 'P1' : 'P2';


      boardCopy[row][column] = currentDisc;


 

      setGame({
        ...game,
        board: boardCopy,
      });



      await wsService.makeMove(game.id, column);

      setError('');
    } catch (err: any) {

      setError(
        err.message || 'Movimento inválido. Tente novamente.'
      );


      if (game) {
        setGame(game);
      }
    }
  };


  const handleSendMessage = async (content: string) => {
    if (!roomId || !user) {
      setError('Erro: impossível enviar mensagem');
      return;
    }

    try {
      await wsService.sendMessage(roomId, content);
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
      setError('Falha ao enviar mensagem');
    }
  };


  const handleResetGame = async () => {
    if (!game) return;

    try {
      await wsService.resetGame(game.id);
      setError('');
    } catch (err: any) {
      console.error('Erro ao reiniciar:', err);
      setError('Falha ao reiniciar jogo');
    }
  };


 

  const handleStartGame = async () => {
    if (!roomId) return;

    try {
      setStartingGame(true);

      const newGame = await apiClient.startGame(roomId);
      setGame(newGame);

      setError('');
    } catch (err: any) {
      console.error('Erro ao iniciar jogo:', err);
      setError('Falha ao iniciar jogo');
    } finally {
      setStartingGame(false);
    }
  };

  if (checkWinner(game?.board ?? [], 0, 0)) {
  console.log('winner');
}

  const winnerName =
  game?.winner?.username ??
  (game?.winnerId === game?.player1Id
    ? game?.player1?.username
    : game?.player2?.username) ??
  'Jogador';
 
  if (loading) {
    return <Loader />;
  }

  

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <Card>
          <p className="text-lg text-red-400">
             {error || 'Sala não encontrada'}
          </p>
        </Card>
      </div>
    );
  }



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4"
    >
      <div className="container mx-auto max-w-7xl">

        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">
            🎮 {room?.name}
          </h1>

          <p className="text-gray-400">
            {game?.status === 'playing'
              ? `Vez do ${game.currentPlayer === 'player1'
                ? 'Jogador 1 🔴'
                : 'Jogador 2 🟡'
              }`
              : game?.status === 'completed'
                ? `Vencedor: ${winnerName} 🏆`
                : game?.status === 'draw'
                  ? 'Empate! 🤝'
                  : 'Aguardando jogadores...'}
          </p>
        </motion.div>


        {error && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <Card>
            
              <GameBoard
                board={game?.board || EMPTY_BOARD}
                onColumnClick={handleMove}
                winPositions={game?.winPositions}
                disabled={isBoardBlocked()}
              />

              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg transition-all ${game?.currentPlayer === 'player1'
                      ? 'bg-red-500 ring-2 ring-red-300'
                      : 'bg-gray-700'
                    }`}
                >
                  <p className="text-sm text-gray-100 mb-2 font-semibold">
                    🔴 Jogador 1
                  </p>

                  <div className="flex items-center gap-2">
                    <img
                      src={room?.player1?.avatar}
                      alt={room?.player1?.username}
                      className="w-8 h-8 rounded-full"
                    />

                    <span className="font-semibold">
                      {room?.player1?.username}
                    </span>

                    {isRoomHost && room?.player1?.id === user?.id && (
                      <span className="ml-auto text-xs bg-blue-600 px-2 py-1 rounded">
                        HOST
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg transition-all ${game?.currentPlayer === 'player2'
                      ? 'bg-yellow-500 ring-2 ring-yellow-300'
                      : 'bg-gray-700'
                    }`}
                >
                  <p className="text-sm text-gray-100 mb-2 font-semibold">
                    🟡 Jogador 2
                  </p>

                  <div className="flex items-center gap-2">
                    {room?.player2 ? (
                      <>
                        <img
                          src={room.player2?.avatar}
                          alt={room.player2?.username}
                          className="w-8 h-8 rounded-full"
                        />

                        <span className="font-semibold">
                          {room.player2?.username}
                        </span>

                        {isRoomHost && room.player2?.id === user?.id && (
                          <span className="ml-auto text-xs bg-blue-600 px-2 py-1 rounded">
                            HOST
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">
                        ⏳ Aguardando jogador...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                
                {!game && canStartGame && isRoomHost && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleStartGame}
                    isLoading={startingGame}
                  >
                    Começar Jogo
                  </Button>
                )}

      
                {!game && !canStartGame && (
                  <div className="bg-blue-900 text-blue-100 p-4 rounded-lg text-center">
                    <p className="text-sm">
                       Aguardando mais um jogador...
                    </p>
                  </div>
                )}

       
                {game && game.status === 'playing' && isCurrentPlayerTurn() && (
                  <div className="bg-green-900 text-green-100 p-4 rounded-lg text-center">
                    <p className="text-sm font-semibold">
                       É a tua vez! Faz uma jogada.
                    </p>
                  </div>
                )}

                {game &&
                  game.status !== 'playing' &&
                  isCurrentPlayer && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleResetGame}
                    >
                       Jogar Novamente
                    </Button>
                  )}
              </div>
            </Card>
          </div>

          <AnimatePresence>
            {game?.status === 'completed' && showWinnerModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  className="relative text-center bg-gray-900 p-8 rounded-2xl shadow-2xl"
                >

                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="absolute top-3 right-3 text-white hover:text-red-400 text-xl"
                  >
                    ✕
                  </button>

                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-7xl mb-4"
                  >
                    🏆
                  </motion.div>

                  <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                    Vitória!
                  </h1>

                  <p className="text-white text-lg">
                     Vencedor:{" "}
                    <span className="font-bold">
                      {game?.winner?.username ||
                        (game?.winnerId === game?.player1Id
                          ? game?.player1?.username
                          : game?.player2?.username) ||
                        "Jogador"}
                    </span>
                  </p>

                  <motion.div
                    className="mt-6 h-1 w-40 bg-yellow-400 mx-auto rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scaleX: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


          <div className="flex flex-col gap-6">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};