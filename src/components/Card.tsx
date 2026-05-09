import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-xl p-6 ${
        hoverable ? 'hover:border-primary-500 hover:bg-opacity-60 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
