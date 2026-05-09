import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './components/Header.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Landing } from './pages/Landing.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Lobby } from './pages/Lobby.js';
import { Game } from './pages/Game.js';
import { Profile } from './pages/Profile.js';
import './styles/globals.css';

function App() {
  useEffect(() => {
  
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userId', payload.userId);
      } catch (e) {
        console.error('Failed to parse token', e);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
      >
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:roomId"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </motion.div>
    </BrowserRouter>
  );
}

export default App;
