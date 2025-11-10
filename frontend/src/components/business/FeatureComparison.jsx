import React from 'react';
import { motion } from 'framer-motion';

const FeatureComparison = () => {
  const features = [
    { feature: 'AI-Powered Email Generation', invoiceAccelerator: '✅', traditional: '❌' },
    { feature: 'Automated Payment Reminders', invoiceAccelerator: '✅', traditional: 'Manual' },
    { feature: 'Real-time Analytics Dashboard', invoiceAccelerator: '✅', traditional: '❌' },
    { feature: 'Multi-channel Invoicing', invoiceAccelerator: '✅', traditional: 'Limited' },
    { feature: 'Custom Branding', invoiceAccelerator: '✅', traditional: '❌' },
    { feature: 'API Integration', invoiceAccelerator: '✅', traditional: '❌' },
    { feature: 'Mobile App', invoiceAccelerator: '✅', traditional: '❌' },
    { feature: '24/7 Support', invoiceAccelerator: '✅', traditional: 'Business Hours' }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Why Choose InvoiceAccelerator?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compare the modern solution against traditional methods
          </p>
        </motion.div>

        <div className="glass dark:glass-dark rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-8 p-8 bg-gray-50 dark:bg-gray-800">
            <div className="font-semibold text-gray-900 dark:text-white">Feature</div>
            <div className="text-center font-semibold text-primary-600 dark:text-primary-400">
              InvoiceAccelerator
            </div>
            <div className="text-center font-semibold text-gray-600 dark:text-gray-400">
              Traditional Tools
            </div>
          </div>
          
          {features.map((item, index) => (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="grid grid-cols-3 gap-8 p-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {item.feature}
              </div>
              <div className="text-center text-green-600 font-semibold">
                {item.invoiceAccelerator}
              </div>
              <div className="text-center text-gray-500">
                {item.traditional}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureComparison;