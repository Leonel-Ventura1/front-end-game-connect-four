import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.js';
import { apiClient } from '../services/api.js';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          useAuthStore.setState({ user: currentUser });
        } catch (error) {
          console.error('Failed to load user:', error);
          useAuthStore.getState().logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [isAuthenticated]);

  return { user, isAuthenticated, loading };
};

export const useLogin = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await apiClient.login(email, password);
      setToken(token);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const useRegister = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await apiClient.register(email, username, password);
      setToken(token);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
