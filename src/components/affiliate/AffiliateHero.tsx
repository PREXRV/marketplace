'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

interface AffiliateHeroProps {
  onRegisterClick: () => void;
}

export default function AffiliateHero({ onRegisterClick }: AffiliateHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 text-white py-24">
      {/* ✅ Замените background на CSS паттерн */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            Зарабатывайте с нами! 💰
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl mb-8 text-purple-100"
          >
            Партнерская программа с комиссией до 30%
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl mb-12 text-purple-200"
          >
            Рекомендуйте наши товары и получайте процент с каждой продажи
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegisterClick}
            className="bg-white text-purple-600 px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all"
          >
            Стать партнером
          </motion.button>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { icon: TrendingUp, value: '30%', label: 'Максимальная комиссия' },
              { icon: Users, value: '1000+', label: 'Активных партнеров' },
              { icon: DollarSign, value: '5M+', label: 'Выплачено партнерам' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-purple-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
