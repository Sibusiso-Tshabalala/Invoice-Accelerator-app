import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingActions = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: '🚀', label: 'Quick Invoice', action: () => alert('Create quick invoice!') },
    { icon: '📊', label: 'Analytics', action: () => alert('View analytics!') },
    { icon: '👥', label: 'Clients', action: () => alert('Manage clients!') },
    { icon: '⚡', label: 'AI Assistant', action: () => alert('Open AI chat!') }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      <AnimatePresence>
        {isOpen && actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.action}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-2xl rounded-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform"
          >
            <span className="text-lg">{action.icon}</span>
            <span>{action.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold"
        >
          +
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActions;