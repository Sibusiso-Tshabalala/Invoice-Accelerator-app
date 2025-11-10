import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      company: "TechGrowth Inc",
      role: "CFO",
      image: "👩‍💼",
      text: "InvoiceAccelerator reduced our payment collection time by 70%. The AI email feature alone saved us 20 hours per month.",
      results: "Payment time ⬇️ 70%"
    },
    {
      name: "Marcus Rodriguez",
      company: "ScaleFast Solutions",
      role: "Operations Director", 
      image: "👨‍💼",
      text: "We onboarded 50+ clients seamlessly. The professional invoices and automated reminders made us look enterprise-grade.",
      results: "Client onboarding ⬆️ 3x faster"
    },
    {
      name: "Jennifer Kim",
      company: "Creative Studio Co",
      role: "Studio Manager",
      image: "👩‍🎨",
      text: "Finally, an invoicing tool that understands creative businesses. The custom branding made all the difference for our agency.",
      results: "Brand consistency ✅ 100%"
    }
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
            Loved by Businesses
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See how companies are transforming their financial operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="glass dark:glass-dark p-8 rounded-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {testimonial.results}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;