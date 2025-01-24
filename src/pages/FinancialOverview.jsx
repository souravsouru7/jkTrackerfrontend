import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
    },
  },
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

const FinancialOverview = React.memo(({ overall }) => {
  const cards = [
    {
      title: "Total Income",
      value: overall.totalIncome,
      gradient: "from-[#B08968] to-[#9C6644]",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
      bgPattern: (
        <svg className="absolute inset-0 w-full h-full text-white/[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern-1" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V.5H32" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-1)"/>
        </svg>
      )
    },
    {
      title: "Total Expenses",
      value: overall.totalExpenses,
      gradient: "from-[#7F5539] to-[#6B4423]",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgPattern: (
        <svg className="absolute inset-0 w-full h-full text-white/[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern-2" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-2)"/>
        </svg>
      )
    },
    {
      title: "Total Balance",
      value: overall.totalBalance,
      gradient: "from-[#9C6644] to-[#8B4513]",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgPattern: (
        <svg className="absolute inset-0 w-full h-full text-white/[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern-3" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M16 0l16 16-16 16L0 16z" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-3)"/>
        </svg>
      )
    }
  ];

  // Modern Mobile design
  const MobileView = () => (
    <div className="block sm:hidden">
      <div className="p-4 space-y-4">
        {/* Featured Card */}
        <motion.div
          variants={cardVariants}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#B08968] to-[#9C6644] rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
            <motion.div
              initial={{ rotate: 0, opacity: 0.1 }}
              animate={{ rotate: 360, opacity: 0.2 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-full h-full"
            >
              {cards[0].icon}
            </motion.div>
          </div>
          {cards[0].bgPattern}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                {cards[0].icon}
              </div>
              <h3 className="text-lg font-semibold text-white/90">{cards[0].title}</h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              ₹{cards[0].value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-white/60 text-sm">
              <span>View Details</span>
              <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Other Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {cards.slice(1).map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg`}
            >
              {card.bgPattern}
              <div className="relative z-10">
                <div className="mb-3">
                  {card.icon}
                </div>
                <h3 className="text-xs font-medium text-white/80 mb-1">{card.title}</h3>
                <p className="text-lg font-bold">
                  ₹{card.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop design
  const DesktopView = () => (
    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          whileHover="hover"
          className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}
        >
          {card.bgPattern}
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {card.icon}
            </motion.div>
          </div>
          <motion.div className="mb-4 w-12 h-12 relative z-10">
            {card.icon}
          </motion.div>
          <h3 className="text-lg font-medium text-white/90 relative z-10">{card.title}</h3>
          <motion.p
            className="text-3xl font-bold mt-2 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ₹{card.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MobileView />
      <DesktopView />
    </motion.div>
  );
});

export default React.memo(FinancialOverview);