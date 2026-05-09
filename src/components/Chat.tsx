import React, { useState } from 'react';
import { Card } from './Card.js';
import { Button } from './Button.js';
import { Message as MessageType } from '../types/index.js';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.js';

interface ChatProps {
  messages: MessageType[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading = false }) => {
  const [input, setInput] = useState('');
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const handleSend = () => {
    if (input.trim() && currentUserId) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!currentUserId) {
    return (
      <Card className="flex flex-col h-96 max-w-md bg-red-900">
        <p className="text-red-200">❌ Erro de autenticação. Por favor, faça login novamente.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-96 max-w-md">
      <h3 className="text-lg font-bold mb-4">💬 Chat</h3>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-2 ${msg.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.userId === currentUserId
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm font-semibold">{msg.username || 'Anónimo'}</p>
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || !currentUserId}
          isLoading={isLoading}
        >
          Enviar
        </Button>
      </div>
    </Card>
  );
};
