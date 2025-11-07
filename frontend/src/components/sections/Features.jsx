import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      title: "AI-Powered",
      description: "Smart invoice generation and automation",
      icon: "🤖"
    },
    {
      title: "Instant Payments",
      description: "Get paid faster with integrated payment processing",
      icon: "⚡"
    },
    {
      title: "Real-time Analytics",
      description: "Track your business performance with live insights",
      icon: "📊"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-gradient"
        >
          Powerful Features
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="glass dark:glass-dark p-8 rounded-2xl text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;