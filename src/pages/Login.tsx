import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { useLogin } from '../hooks/useAuth.js';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useLogin();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await login(formData.email, formData.password);
      navigate('/lobby');
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md">
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold mb-6 text-center"
        >
           Login
        </motion.h2>

        {error && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-red-600 text-white p-3 rounded-lg mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        {formError && (
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-red-600 text-white p-3 rounded-lg mb-4 text-sm"
          >
            {formError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300">
            Registre-se aqui
          </Link>
        </p>
      </Card>
    </motion.div>
  );
};
