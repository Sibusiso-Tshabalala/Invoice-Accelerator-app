import React from 'react';
import { motion } from 'framer-motion';

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">See InvoiceAccelerator in Action</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Experience the power of AI-powered invoicing
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass dark:glass-dark p-8 rounded-2xl mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Live Demo</h2>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center h-64 flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Interactive demo coming soon! In the meantime, try our 14-day free trial.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => alert('Starting your free trial! Redirecting to signup...')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-lg"
          >
            Start Free Trial
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Demo;