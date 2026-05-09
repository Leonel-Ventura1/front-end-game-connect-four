import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { Room } from '../types/index.js';
import { apiClient } from '../services/api.js';
import { Loader } from '../components/Loader.js';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await apiClient.listRooms();
      setRooms(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setCreatingRoom(true);
    try {
      const room = await apiClient.createRoom(roomName);
      navigate(`/game/${room.id}`);
    } catch (err: any) {
      setError('Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await apiClient.joinRoom(roomId);
      navigate(`/game/${roomId}`);
    } catch (err: any) {
      setError('Failed to join room');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          🎮 Sala de Multiplayer
        </motion.h1>

        {error && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-red-600 text-white p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Create Room Section */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Criar Sala</h2>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '✕' : '+'}
            </Button>
          </div>

          {showCreateForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex gap-4"
            >
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Room name..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="primary"
                onClick={handleCreateRoom}
                isLoading={creatingRoom}
                disabled={!roomName.trim()}
              >
                Criar
              </Button>
            </motion.div>
          )}
        </Card>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhuma sala disponível. Crie uma para começar a jogar!</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Card hoverable>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-primary-400 font-semibold">{room.status}</span>
                    </p>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <img
                        src={room.player1.avatar}
                        alt={room.player1.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{room.player1.username}</span>
                    </div>
                    {room.player2 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <img
                          src={room.player2.avatar}
                          alt={room.player2.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{room.player2.username}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Esperando por um jogador...</div>
                    )}
                  </div>

                  {!room.player2 && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleJoinRoom(room.id)}
                      className="w-full"
                    >
                      Entrar no Jogo
                    </Button>
                  )}
  
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
