import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
  const stats = [
    { label: 'Total Invoices', value: '1,247', change: '+12%', trend: 'up' },
    { label: 'Revenue', value: 'R 89,420', change: '+23%', trend: 'up' },
    { label: 'Overdue', value: '23', change: '-5%', trend: 'down' },
    { label: 'Avg. Payment Time', value: '14 days', change: '-8%', trend: 'down' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Real-time Analytics
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your business performance with live insights and predictive analytics
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass dark:glass-dark p-6 rounded-2xl text-center"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{stat.label}</p>
              <span className={`text-sm font-semibold ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass dark:glass-dark p-8 rounded-2xl"
        >
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive revenue chart coming soon...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;