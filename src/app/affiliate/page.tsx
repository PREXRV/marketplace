'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AffiliateHero from '@/components/affiliate/AffiliateHero';
import HowItWorks from '@/components/affiliate/HowItWorks';
import TierSystem from '@/components/affiliate/TierSystem';
import RegistrationForm from '@/components/affiliate/RegistrationForm';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import { useAuth } from '@/context/AuthContext';
import { affiliateAPI } from '@/services/api';

export default function AffiliatePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState<boolean | null>(null); // null = проверяем
  const [checkingAffiliate, setCheckingAffiliate] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  // ✅ Проверяем является ли пользователь партнером
  useEffect(() => {
    if (isAuthenticated) {
      checkAffiliateStatus();
    }
  }, [isAuthenticated]);

  const checkAffiliateStatus = async () => {
    setCheckingAffiliate(true);
    try {
      const response = await affiliateAPI.getMe();
      setIsAffiliate(true); // Пользователь уже партнер
    } catch (error: any) {
      setIsAffiliate(false); // Не партнер
    } finally {
      setCheckingAffiliate(false);
    }
  };

  const fetchTiers = async () => {
    setTiersLoading(true);
    try {
      const response = await affiliateAPI.getTiers();
      const tiersData = response.data.results || response.data || [];
      setTiers(tiersData);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setTiers([]);
    } finally {
      setTiersLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setIsAffiliate(true); // Теперь пользователь - партнер
  };

  // Загрузка начальная
  if (loading || (isAuthenticated && checkingAffiliate)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // ✅ Если пользователь авторизован И является партнером - показываем дашборд
  if (isAuthenticated && isAffiliate) {
    return <AffiliateDashboard />;
  }

  // ✅ Если пользователь авторизован НО НЕ партнер - показываем страницу с призывом зарегистрироваться
  if (isAuthenticated && isAffiliate === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <AffiliateHero onRegisterClick={() => setShowRegistration(true)} />
        
        {tiersLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <TierSystem tiers={tiers} />
        )}
        
        <HowItWorks />

        {/* Специальное сообщение для авторизованных */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              👋 Привет, {user?.first_name || user?.username}!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Вы авторизованы, но еще не зарегистрированы в партнерской программе
            </p>
            <button
              onClick={() => setShowRegistration(true)}
              className="bg-white text-purple-600 px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              Зарегистрироваться в программе
            </button>
          </div>
        </section>

        {showRegistration && (
          <RegistrationForm 
            onClose={() => setShowRegistration(false)}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    );
  }

  // ✅ Не авторизован - показываем обычную страницу
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AffiliateHero onRegisterClick={() => setShowRegistration(true)} />
      
      {tiersLoading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <TierSystem tiers={tiers} />
      )}
      
      <HowItWorks />

      {showRegistration && (
        <RegistrationForm onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}
