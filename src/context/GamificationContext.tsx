'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, GamificationStats, UserLevel, UserQuest, DailyBonus } from '@/lib/api';
import { useAuth } from './AuthContext';

// Типы
interface RewardItem {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  cost: number;
  stock: number;
}

interface GamificationContextType {
  stats: GamificationStats | null;
  userLevel: UserLevel | null;
  myQuests: UserQuest[];
  dailyBonus: DailyBonus | null;
  rewards: RewardItem[];
  loading: boolean;
  refreshStats: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshDailyBonus: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { tokens, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [myQuests, setMyQuests] = useState<UserQuest[]>([]);
  const [dailyBonus, setDailyBonus] = useState<DailyBonus | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    if (!tokens) return;

    try {
      const [statsData, levelData] = await Promise.all([
        api.getGamificationStats(tokens.access),
        api.getMyLevel(tokens.access),
      ]);

      setStats(statsData);
      setUserLevel(levelData);

      // Пример: загружаем награды вместе со статистикой (или отдельным API)
      if (statsData.rewards) {
        setRewards(statsData.rewards);
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    }
  };

  const refreshQuests = async () => {
    if (!tokens) return;

    try {
      const questsData = await api.getMyQuests(tokens.access);
      setMyQuests(questsData);
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const refreshDailyBonus = async () => {
    if (!tokens) return;

    try {
      const bonusData = await api.getDailyBonusStatus(tokens.access);
      setDailyBonus(bonusData);
    } catch (error) {
      console.error('Error fetching daily bonus:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && tokens) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          refreshStats(),
          refreshQuests(),
          refreshDailyBonus(),
        ]);
        setLoading(false);
      };
      loadData();
    } else {
      setStats(null);
      setUserLevel(null);
      setMyQuests([]);
      setDailyBonus(null);
      setRewards([]);
      setLoading(false);
    }
  }, [isAuthenticated, tokens]);

  return (
    <GamificationContext.Provider
      value={{
        stats,
        userLevel,
        myQuests,
        dailyBonus,
        rewards,
        loading,
        refreshStats,
        refreshQuests,
        refreshDailyBonus,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}