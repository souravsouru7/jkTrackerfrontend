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

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const FinancialOverview = React.memo(({ overall }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4"
    >
      {/* Income Card */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="bg-gradient-to-br from-[#B08968] to-[#9C6644] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </motion.div>
        </div>
        <motion.div variants={iconVariants} className="mb-4">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <h3 className="text-lg font-medium text-white/90">Total Income</h3>
        <motion.p
          className="text-3xl font-bold mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ₹{overall.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </motion.p>
      </motion.div>

      {/* Expenses Card */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="bg-gradient-to-br from-[#7F5539] to-[#6B4423] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-9h-3V8c0-.55-.45-1-1-1s-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1z" />
            </svg>
          </motion.div>
        </div>
        <motion.div variants={iconVariants} className="mb-4">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <h3 className="text-lg font-medium text-white/90">Total Expenses</h3>
        <motion.p
          className="text-3xl font-bold mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          ₹{overall.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </motion.p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="bg-gradient-to-br from-[#9C6644] to-[#8B4513] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
            </svg>
          </motion.div>
        </div>
        <motion.div variants={iconVariants} className="mb-4">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <h3 className="text-lg font-medium text-white/90">Total Balance</h3>
        <motion.p
          className="text-3xl font-bold mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          ₹{overall.totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </motion.p>
      </motion.div>
    </motion.div>
  );
});

export default React.memo(FinancialOverview);