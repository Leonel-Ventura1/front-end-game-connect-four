import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
import { Button } from './Button.js';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 bg-opacity-80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-yellow bg-clip-text text-transparent">
            🎮 Connect Four
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link to={`/profile/${user.id}`}>
                <span className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2">
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                  {user.username}
                </span>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Terminar Sessão
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};
