import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = React.useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  React.useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

const AnimatedStats = () => {
 const stats = [
  { label: 'Invoices Created', value: 1247, suffix: '+', color: 'from-blue-500 to-cyan-500' },
  { label: 'Revenue Generated', value: 4.2, suffix: 'M+ ZAR', color: 'from-green-500 to-emerald-500' },
  { label: 'Happy Clients', value: 342, suffix: '+', color: 'from-purple-500 to-pink-500' },
  { label: 'Time Saved', value: 1240, suffix: 'hrs', color: 'from-orange-500 to-red-500' }
];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Real Impact, Real Results
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of businesses transforming their invoicing process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-1 rounded-2xl`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center backdrop-blur-sm">
                  <motion.div
                    className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4`}
                  >
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;