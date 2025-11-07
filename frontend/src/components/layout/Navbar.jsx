import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext'; // Add this import

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme(); // Now this will work

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass dark:glass-dark sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-gradient"
          >
            InvoiceAccelerator
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <motion.a
                key={item}
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle & CTA */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass dark:glass-dark"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;