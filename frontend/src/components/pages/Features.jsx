import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      title: "AI-Powered Invoicing",
      description: "Automated invoice generation and intelligent payment reminders",
      icon: "🤖"
    },
    {
      title: "Advanced Analytics",
      description: "Real-time insights into your payment patterns and cash flow",
      icon: "📊"
    },
    {
      title: "Secure Payments",
      description: "Multiple payment gateways with bank-level security",
      icon: "🔒"
    },
    {
      title: "Custom Branding",
      description: "White-label solutions with your company branding",
      icon: "🎨"
    }
  ];

  return (
    <div className="pt-20 min-h-screen">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to streamline your invoicing and get paid faster
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass dark:glass-dark p-6 rounded-2xl text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
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
    </div>
  );
};

export default Features;