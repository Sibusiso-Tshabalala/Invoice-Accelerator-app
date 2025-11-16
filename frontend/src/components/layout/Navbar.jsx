import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
// Fix this import - use the correct path
import { useTheme } from '../../contexts/ThemeContext'; // Changed from '../../hooks/useTheme'

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/pricing');
  };

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
  className="flex items-center space-x-3 cursor-pointer"
  onClick={() => navigate('/')}
>
  <img 
    src="/logo.svg" 
    alt="InvoiceAccelerator" 
    className="w-8 h-8"
  />
  <span className="text-2xl font-bold text-gradient">
    InvoiceAccelerator
  </span>
</motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/features">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                Features
              </motion.span>
            </Link>
            <Link to="/pricing">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                Pricing
              </motion.span>
            </Link>
            <Link to="/about">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                About
              </motion.span>
            </Link>
            <Link to="/contact">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                Contact
              </motion.span>
            </Link>
            <Link to="/demo">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
              >
                Demo
              </motion.span>
            </Link>
          </div>

          {/* Theme Toggle & CTA */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass dark:glass-dark"
            >
              {isDark ? '🌙' : '☀️'}
            </button>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;