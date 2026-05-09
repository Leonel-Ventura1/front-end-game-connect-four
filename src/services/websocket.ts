import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  private eventHandlers = new Map<
    string,
    Set<Function>
  >();

  async connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve();
          return;
        }

        this.socket = io(
          import.meta.env.VITE_WS_URL,
          {
            auth: { token },

            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,

            transports: ['websocket'],
          }
        );

        this.socket.on('connect', () => {
          console.log(
            '✅ WebSocket connected'
          );

          resolve();
        });

        this.socket.on(
          'connect_error',
          (error) => {
            console.error(
              '❌ WebSocket error:',
              error
            );

            reject(error);
          }
        );

        this.socket.on(
          'disconnect',
          (reason) => {
            console.log(
              '⚠️ WebSocket disconnected:',
              reason
            );
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (!this.socket) return;

    this.removeAllListeners();

    this.socket.disconnect();

    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

 

  private registerListener(
    event: string,
    callback: (data: any) => void
  ) {
    if (!this.socket) return;


    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(
        event,
        new Set()
      );


      this.socket.on(event, (data: any) => {
        const handlers =
          this.eventHandlers.get(event);

        if (!handlers) return;

        handlers.forEach((handler) => {
          handler(data);
        });
      });
    }

  
    this.eventHandlers
      .get(event)
      ?.add(callback);
  }

  private unregisterListener(
    event: string,
    callback?: Function
  ) {
    if (!this.socket) return;


    if (callback) {
      this.eventHandlers
        .get(event)
        ?.delete(callback);

      return;
    }

  
    this.eventHandlers.delete(event);

    this.socket.off(event);
  }

  removeAllListeners() {
    if (!this.socket) return;

    this.eventHandlers.forEach(
      (_, event) => {
        this.socket?.off(event);
      }
    );

    this.eventHandlers.clear();
  }



  joinRoom(roomId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'room:join',
        roomId,
        (response: any) => {
          if (response?.ok) {
            resolve(response.room);
          } else {
            reject(
              new Error(
                response?.error ||
                  'Erro ao entrar na sala'
              )
            );
          }
        }
      );
    });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit(
      'room:leave',
      roomId
    );
  }

  onUserJoined(
    callback: (data: any) => void
  ) {
    this.registerListener(
      'room:user-joined',
      callback
    );
  }

  offUserJoined(callback?: Function) {
    this.unregisterListener(
      'room:user-joined',
      callback
    );
  }

  onUserLeft(
    callback: (data: any) => void
  ) {
    this.registerListener(
      'room:user-left',
      callback
    );
  }

 

  startGame(gameId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'game:start',
        { gameId },
        (response: any) => {
          if (response?.ok) {
            resolve(response.game);
          } else {
            reject(
              new Error(
                response?.error ||
                  'Erro ao iniciar jogo'
              )
            );
          }
        }
      );
    });
  }

  makeMove(
    gameId: string,
    column: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'game:move',
        {
          gameId,
          column,
        },
        (response: any) => {
          if (response?.ok) {
            resolve(response.game);
          } else {
            reject(
              new Error(
                response?.error ||
                  'Movimento inválido'
              )
            );
          }
        }
      );
    });
  }

  resetGame(gameId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'game:reset',
        gameId,
        (response: any) => {
          if (response?.ok) {
            resolve(response.game);
          } else {
            reject(
              new Error(
                response?.error ||
                  'Erro ao resetar jogo'
              )
            );
          }
        }
      );
    });
  }

  onGameStarted(
    callback: (game: any) => void
  ) {
    this.registerListener(
      'game:started',
      callback
    );
  }

  offGameStarted(callback?: Function) {
    this.unregisterListener(
      'game:started',
      callback
    );
  }

  onGameUpdated(
    callback: (game: any) => void
  ) {
    this.registerListener(
      'game:updated',
      callback
    );
  }

  offGameUpdated(callback?: Function) {
    this.unregisterListener(
      'game:updated',
      callback
    );
  }

  onGameEnded(
    callback: (game: any) => void
  ) {
    this.registerListener(
      'game:ended',
      callback
    );
  }

  offGameEnded(callback?: Function) {
    this.unregisterListener(
      'game:ended',
      callback
    );
  }



  sendMessage(
    roomId: string,
    content: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        'chat:message',
        {
          roomId,
          content,
        },
        (response: any) => {
          if (response?.ok) {
            resolve();
          } else {
            reject(
              new Error(
                response?.error ||
                  'Erro ao enviar mensagem'
              )
            );
          }
        }
      );
    });
  }

  onNewMessage(
    callback: (message: any) => void
  ) {
    this.registerListener(
      'chat:new-message',
      callback
    );
  }

  offNewMessage(callback?: Function) {
    this.unregisterListener(
      'chat:new-message',
      callback
    );
  }

  onUserTyping(
    callback: (data: any) => void
  ) {
    this.registerListener(
      'chat:user-typing',
      callback
    );
  }

  emitTyping(
    roomId: string,
    typing: boolean
  ) {
    this.socket?.emit('chat:typing', {
      roomId,
      typing,
    });
  }



  on(
    event: string,
    callback: (...args: any[]) => void
  ) {
    this.registerListener(event, callback);
  }

  off(
    event: string,
    callback?: (...args: any[]) => void
  ) {
    this.unregisterListener(event, callback);
  }
}

export const wsService =
  new WebSocketService();