export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  createdAt: Date;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface GameMove {
  column: number;
  row: number;
  playerId: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  player1Id: string;
  player2Id?: string;
  winnerId?: string;
  board: (string | null)[][];
  currentPlayer: 'player1' | 'player2';
  moves: GameMove[];
  status: 'playing' | 'completed' | 'draw';
  winType?: 'horizontal' | 'vertical' | 'diagonal';
  winPositions?: [number, number][];
  createdAt: Date;
  player1?: { id: string; username: string; avatar: string };
  player2?: { id: string; username: string; avatar: string };
  winner?: { id: string; username: string };
}

export interface Room {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'completed';
  host: { id: string; username: string; avatar: string };
  player1: { id: string; username: string; avatar: string };
  player2?: { id: string; username: string; avatar: string };
  game?: GameState;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  avatar: string;
  roomId: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}
