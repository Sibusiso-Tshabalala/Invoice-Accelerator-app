import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { PayPalProvider } from './components/payments/PayPalProvider';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import TrustBadges from './components/social/TrustBadges';
import Features from './components/sections/Features';
import ROICalculator from './components/business/ROICalculator';
import Testimonials from './components/social/Testimonials';
import FeatureComparison from './components/business/FeatureComparison';
import EmailGenerator from './components/ai/EmailGenerator';
import AIChatAssistant from './components/ai/AIChatAssistant';
import AIAnalytics from './components/ai/AIAnalytics';
import PricingCards from './components/payments/PricingCards';
import CTA from './components/sections/CTA';
import Footer from './components/layout/Footer';
import './index.css';


function App() {
  return (
    <ThemeProvider>
      <PayPalProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300">
          <AIChatAssistant />
          <Navbar />
          <main>
            <Hero />
            <TrustBadges />
            <Features />
            <EmailGenerator />
            <AIAnalytics />
            <ROICalculator />
            <Testimonials />
            <FeatureComparison />
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