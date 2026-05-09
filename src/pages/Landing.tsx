import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { useAuthStore } from '../store/auth.js';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
  
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen gap-12">
       
        <motion.div variants={itemVariants} className="text-center max-w-2xl">
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-primary-400 via-accent-yellow to-accent-red bg-clip-text text-transparent">
            Connect Four Online
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
           O jogo clássico de estratégia em tempo real com design de jogo moderno
          </p>
        </motion.div>

  
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          {[
            {
              icon: '🎮',
              title: 'Jogo Multijogador Online',
              description: 'Jogar com amigos online instantaneamente',
            },
        
            {
              icon: '📊',
              title: 'Estatísticas & Histórico',
              description: 'Acompanhe seu desempenho e progresso ao longo do tempo',
            },
          ].map((feature, idx) => (
            <Card key={idx}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

      
        <motion.div variants={itemVariants} className="flex gap-6 flex-col sm:flex-row">
          {isAuthenticated ? (
            <>
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/lobby')}
              >
                Jogar Agora
              </Button>
           
            </>
          ) : (
            <>
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/login')}
              >
                 Entrar
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/register')}
              >
                 Registrar
              </Button>
            </>
          )}
        </motion.div>

        
      </div>
    </motion.div>
  );
};
