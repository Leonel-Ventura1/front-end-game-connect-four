import React from 'react';
import { motion } from 'framer-motion';

export const Loader: React.FC = () => {
  return (
    <motion.div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-xl text-gray-300"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};
