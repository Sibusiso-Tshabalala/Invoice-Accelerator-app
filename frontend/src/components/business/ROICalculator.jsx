import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ROICalculator = () => {
  const [invoices, setInvoices] = useState(50);
  const [time, setTime] = useState(2);

  const savings = {
    time: invoices * time * 0.7, // 70% time savings
    money: invoices * 15, // $15 per invoice saved
    lateFees: invoices * 0.3 * 50 // 30% fewer late payments
  };

  const totalSavings = savings.time * 25 + savings.money + savings.lateFees; // $25/hour rate

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See how much time and money you'll save with automated invoicing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Calculator Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass dark:glass-dark p-8 rounded-2xl"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Invoices
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={invoices}
                  onChange={(e) => setInvoices(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {invoices} invoices/month
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hours per Invoice (Manual)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {time} hours/invoice
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="text-5xl font-bold text-gradient mb-4">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Estimated Annual Savings
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex justify-between">
                  <span>Time Savings:</span>
                  <span className="font-semibold text-green-600">
                    {savings.time.toFixed(0)} hrs/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Operational Savings:</span>
                  <span className="font-semibold text-green-600">
                    ${savings.money.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Late Fee Reduction:</span>
                  <span className="font-semibold text-green-600">
                    ${savings.lateFees.toLocaleString()}/month
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;