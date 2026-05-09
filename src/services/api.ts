import axios, { AxiosInstance } from 'axios';
import { AuthResponse, User, UserProfile, Room, GameState, Message } from '../types/index.js';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
    });

  
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

  
    this.client.interceptors.response.use((response) => {
      const parseGameData = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        if ('board' in obj && typeof obj.board === 'string') {
          try {
            obj.board = JSON.parse(obj.board);
          } catch (e) {
            console.error('Failed to parse board:', e);
          }
        }
        if ('moves' in obj && typeof obj.moves === 'string') {
          try {
            obj.moves = JSON.parse(obj.moves);
          } catch (e) {
            console.error('Failed to parse moves:', e);
          }
        }
        if ('winPositions' in obj && typeof obj.winPositions === 'string') {
          try {
            obj.winPositions = JSON.parse(obj.winPositions);
          } catch (e) {
            console.error('Failed to parse winPositions:', e);
          }
        }
        
       
        if (Array.isArray(obj.moves) && !obj.currentPlayer) {
          obj.currentPlayer = obj.moves.length % 2 === 0 ? 'player1' : 'player2';
        }
        
        return obj;
      };

      if (response.data && typeof response.data === 'object') {
 
        parseGameData(response.data);
        
   
        if ('game' in response.data && response.data.game) {
          parseGameData(response.data.game);
        }
        

        if (Array.isArray(response.data)) {
          response.data.forEach((item) => {
            parseGameData(item);
            if ('game' in item && item.game) {
              parseGameData(item.game);
            }
          });
        }
      }
      return response;
    });
  }


  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/api/auth/register', {
      email,
      username,
      password,
    });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/api/auth/login', {
      email,
      password,
    });
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get('/api/auth/me');
    return data;
  }

 
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data } = await this.client.get(`/api/users/${userId}`);
    return data;
  }

  async getUserStats(userId: string) {
    const { data } = await this.client.get(`/api/users/${userId}/stats`);
    return data;
  }

  async getUserGames(userId: string, limit = 20, offset = 0) {
    const { data } = await this.client.get(`/api/users/${userId}/games`, {
      params: { limit, offset },
    });
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data } = await this.client.put(`/api/users/${userId}`, updates);
    return data;
  }


  async listRooms(limit = 50, offset = 0): Promise<Room[]> {
    const { data } = await this.client.get('/api/rooms', {
      params: { limit, offset },
    });
    return data;
  }

  async getRoomById(roomId: string): Promise<Room> {
    const { data } = await this.client.get(`/api/rooms/${roomId}`);
    return data;
  }

  async createRoom(name: string): Promise<Room> {
    const { data } = await this.client.post('/api/rooms', { name });
    return data;
  }

  async joinRoom(roomId: string): Promise<Room> {
    const { data } = await this.client.post(`/api/rooms/${roomId}/join`);
    return data;
  }

  async leaveRoom(roomId: string) {
    const { data } = await this.client.post(`/api/rooms/${roomId}/leave`);
    return data;
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<Message[]> {
    const { data } = await this.client.get(`/api/rooms/${roomId}/messages`, {
      params: { limit },
    });
    return data;
  }

  async sendMessage(roomId: string, content: string): Promise<Message> {
    const { data } = await this.client.post(`/api/rooms/${roomId}/messages`, { content });
    return data;
  }


  async getGameById(gameId: string): Promise<GameState> {
    const { data } = await this.client.get(`/api/games/${gameId}`);
    return data;
  }

  async makeMove(gameId: string, column: number): Promise<GameState> {
    const { data } = await this.client.post(`/api/games/${gameId}/move`, { column });
    return data;
  }

  async resetGame(gameId: string): Promise<GameState> {
    const { data } = await this.client.post(`/api/games/${gameId}/reset`);
    return data;
  }

  async startGame(roomId: string): Promise<GameState> {
    const { data } = await this.client.post(`/api/rooms/${roomId}/start-game`);
    return data;
  }
}

export const apiClient = new ApiClient();
