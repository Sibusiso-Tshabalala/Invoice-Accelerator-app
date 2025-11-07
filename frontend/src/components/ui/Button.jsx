import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', onClick, disabled = false, ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transform transition-all duration-200 focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg',
    secondary: 'glass text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/50',
    ghost: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;