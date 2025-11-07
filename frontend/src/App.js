import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { PayPalProvider } from './components/payments/PayPalProvider';
import AnimatedBackground from './components/background/AnimatedBackground';
import ChatAssistant from './components/ai/ChatAssistant';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import PricingCards from './components/payments/PricingCards';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';
import CTA from './components/sections/CTA';
import Footer from './components/layout/Footer';
import './index.css';


function App() {
  return (
    <ThemeProvider>
      <PayPalProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300">
          <AnimatedBackground />
          <ChatAssistant />
          <Navbar />
          <main>
            <Hero />
            <Features />
            <AnalyticsDashboard />
            <PricingCards />
            <CTA />
          </main>
          <Footer />
        </div>
      </PayPalProvider>
    </ThemeProvider>
  );
}

export default App;