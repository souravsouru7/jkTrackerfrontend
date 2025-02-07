import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverallSummary } from '../../store/slice/balanceSheetSlice';
import { motion } from 'framer-motion';

const OverallSummary = () => {
  const dispatch = useDispatch();
  const { overallSummary, loading } = useSelector((state) => state.balanceSheet);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchOverallSummary(user._id));
    }
  }, [dispatch, user]);

  const LoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="bg-gray-800/90 p-6 rounded-xl">
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Overall Summary Card */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/90 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Overall Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 p-4 rounded-lg">
            <h3 className="text-green-400 font-semibold">Total Income</h3>
            <p className="text-2xl text-white">${overallSummary.overall.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/20 p-4 rounded-lg">
            <h3 className="text-red-400 font-semibold">Total Expenses</h3>
            <p className="text-2xl text-white">${overallSummary.overall.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500/20 p-4 rounded-lg">
            <h3 className="text-blue-400 font-semibold">Net Balance</h3>
            <p className="text-2xl text-white">${overallSummary.overall.netBalance.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Project-wise Breakdown */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/90 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Project-wise Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Project</th>
                <th className="text-right p-2">Income</th>
                <th className="text-right p-2">Expenses</th>
                <th className="text-right p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {overallSummary.projectWise.map((project, index) => (
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  key={index}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="p-2">{project.projectName}</td>
                  <td className="text-right p-2 text-green-400">
                    ${project.income.toLocaleString()}
                  </td>
                  <td className="text-right p-2 text-red-400">
                    ${project.expenses.toLocaleString()}
                  </td>
                  <td className="text-right p-2">
                    <span className={project.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${project.balance.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OverallSummary;