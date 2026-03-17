'use client';

import { motion } from 'framer-motion';
import { UserPlus, Share2, ShoppingCart, Wallet } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Регистрация',
      description: 'Зарегистрируйтесь в партнерской программе и получите уникальную реферальную ссылку',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Share2,
      title: 'Делитесь ссылкой',
      description: 'Размещайте ссылку в соцсетях, блоге или отправляйте друзьям',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: ShoppingCart,
      title: 'Клиенты покупают',
      description: 'Ваши рефералы совершают покупки по вашей ссылке',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Wallet,
      title: 'Получайте деньги',
      description: 'Получайте процент с каждой продажи на свой счет',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Как это работает?</h2>
          <p className="text-xl text-gray-600">
            Всего 4 простых шага до первого заработка
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`bg-gradient-to-r ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 text-purple-400">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
