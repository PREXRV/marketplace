'use client';

import { motion } from 'framer-motion';
import { Star, Award, Crown, TrendingUp, Check } from 'lucide-react';

interface TierSystemProps {
  tiers: any[];
}

const tierIcons = {
  novice: Star,
  blogger: Award,
  ambassador: Crown,
};

const tierColors = {
  novice: 'from-gray-400 to-gray-600',
  blogger: 'from-blue-500 to-purple-600',
  ambassador: 'from-yellow-400 to-orange-600',
};

export default function TierSystem({ tiers }: TierSystemProps) {
  // Защита от undefined/null
  const safeTiers = Array.isArray(tiers) ? tiers : [];
  
  if (safeTiers.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Уровни партнерской программы</h2>
            <p className="text-xl text-gray-600 mb-12">
              Загрузка уровней программы...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Уровни партнерской программы</h2>
          <p className="text-xl text-gray-600">
            Развивайтесь вместе с нами и получайте больше
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safeTiers.map((tier, index) => {
            const Icon = tierIcons[tier.tier as keyof typeof tierIcons] || Star;
            const isPopular = tier.tier === 'blogger';
            const colorGradient = tierColors[tier.tier as keyof typeof tierColors] || 'from-gray-400 to-gray-600';

            return (
              <motion.div
                key={tier.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden ${
                  isPopular ? 'ring-4 ring-purple-500 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-bl-2xl font-bold">
                    🔥 Популярный
                  </div>
                )}

                <div className={`bg-gradient-to-r ${colorGradient} p-8 text-white`}>
                  <Icon className="w-16 h-16 mb-4" />
                  <h3 className="text-3xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{tier.commission_rate}%</span>
                    <span className="text-xl opacity-90">комиссия</span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Требования:</span>
                    </div>
                    <p className="text-gray-700">
                      {tier.min_sales} - {tier.max_sales || '∞'} продаж
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <p className="font-semibold text-gray-800 mb-3">Преимущества:</p>
                    {Array.isArray(tier.benefits) && tier.benefits.map((benefit: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {index === 0 ? 'Начать с этого уровня' : 'Перейти на уровень'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
