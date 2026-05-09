import { create } from 'zustand';
import { Room, Message, GameState } from '../types/index.js';

interface GameStore {
  currentRoom: Room | null;
  currentGame: GameState | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  setCurrentRoom: (room: Room | null) => void;
  setCurrentGame: (game: GameState | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentRoom: null,
  currentGame: null,
  messages: [],
  isLoading: false,
  error: null,
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setCurrentGame: (game) => set({ currentGame: game }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    currentRoom: null,
    currentGame: null,
    messages: [],
    error: null,
  }),
}));
