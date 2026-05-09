import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/Card.js';
import { Loader } from '../components/Loader.js';
import { UserProfile } from '../types/index.js';
import { apiClient } from '../services/api.js';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!userId) return;
        const data = await apiClient.getUserProfile(userId);
        setProfile(data);
      } catch (err: any) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card>
          <p className="text-lg text-red-400">{error || 'Profile not found'}</p>
        </Card>
      </div>
    );
  }

  const winRate = profile.stats.totalGames > 0 
    ? Math.round((profile.stats.wins / profile.stats.totalGames) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4"
    >
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">

          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            src={profile.avatar}
            alt={profile.username}
            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-primary-500"
          />

      
          <h1 className="text-4xl font-bold mb-2">{profile.username}</h1>
          <p className="text-gray-400 mb-8">{profile.email}</p>

        
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Wins', value: profile.stats.wins, color: 'text-green-400' },
              { label: 'Losses', value: profile.stats.losses, color: 'text-red-400' },
              { label: 'Draws', value: profile.stats.draws, color: 'text-yellow-400' },
              { label: 'Total', value: profile.stats.totalGames, color: 'text-blue-400' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.1 }}
                className="bg-gray-700 p-4 rounded-lg"
              >
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

  
          <div className="bg-gradient-to-r from-primary-600 to-accent-yellow p-6 rounded-lg mb-8">
            <p className="text-gray-300 mb-2">Win Rate</p>
            <p className="text-4xl font-bold text-white">{winRate}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1 }}
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
              />
            </div>
          </div>

         
          <p className="text-gray-400 text-sm">
            Membro desde {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </Card>
      </div>
    </motion.div>
  );
};
