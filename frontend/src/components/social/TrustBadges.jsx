import React from 'react';
import { motion } from 'framer-motion';

const TrustBadges = () => {
  const badges = [
    { text: '5,000+ Businesses', icon: '🏢' },
    { text: '98% Satisfaction', icon: '⭐' },
    { text: '24/7 Support', icon: '🛡️' },
    { text: 'SOC 2 Compliant', icon: '🔒' }
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {badge.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;