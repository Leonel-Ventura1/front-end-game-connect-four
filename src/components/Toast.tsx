import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : -50 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-semibold ${colors[type]}`}
    >
      {message}
    </motion.div>
  );
};
