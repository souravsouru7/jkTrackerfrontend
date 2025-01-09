import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchBalanceSummary,
  fetchMonthlyBreakdown,
  fetchYearlyBreakdown,
} from '../../store/slice/balanceSheetSlice';

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('monthly');
  const [isScrolled, setIsScrolled] = useState(false);
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;

  const { summary, monthly, yearly } = useSelector((state) => state.balanceSheet);

  useEffect(() => {
    if (userId && selectedProject) {
      dispatch(fetchBalanceSummary(userId));
      dispatch(fetchMonthlyBreakdown({ userId, year: selectedYear }));
      dispatch(fetchYearlyBreakdown(userId));
    }
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, userId, selectedYear, selectedProject?._id]);

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
        <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-[#7F5539] mb-4">Select a Project</h2>
          <p className="text-[#9C6644]">Please select a project from the dashboard to view its balance sheet.</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
        <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
          <p className="text-[#7F5539]">Please log in to view the balance sheet.</p>
        </div>
      </div>
    );
  }

  if (summary.error || monthly.error || yearly.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
        <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
          <p className="text-red-600">Error loading data: {summary.error || monthly.error || yearly.error}</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] py-8 relative">
      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/30 backdrop-blur-md border-b border-[#B08968]/20' : ''
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[#7F5539]">
              Balance Sheet
              <span className="block text-sm font-normal text-[#9C6644] mt-1">Track your financial overview</span>
            </h1>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="mt-24 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-[#7F5539] mb-6">Overall Summary</h2>
          {summary.loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B08968]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Total Income</h3>
                <p className="text-3xl font-bold text-green-600">₹{(summary.totalIncome || 0).toFixed(2)}</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-500">₹{(summary.totalExpenses || 0).toFixed(2)}</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Net Balance</h3>
                <p className="text-3xl font-bold text-[#9C6644]">₹{(summary.netBalance || 0).toFixed(2)}</p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'monthly'
                ? 'bg-[#B08968] text-white'
                : 'bg-white/50 text-[#7F5539] border border-[#B08968]/20 hover:bg-white/70'
            }`}
          >
            Monthly Breakdown
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'yearly'
                ? 'bg-[#B08968] text-white'
                : 'bg-white/50 text-[#7F5539] border border-[#B08968]/20 hover:bg-white/70'
            }`}
          >
            Yearly Breakdown
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl p-6">
          {activeTab === 'monthly' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#7F5539]">Monthly Breakdown</h2>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white/50 border border-[#B08968]/20 rounded-lg px-4 py-2 text-[#7F5539] focus:ring-2 focus:ring-[#B08968] focus:border-[#B08968] transition-all duration-200"
                >
                  {(yearly.data.length > 0 ? yearly.data : [{ year: new Date().getFullYear() }])
                    .map((year) => (
                      <option key={year.year} value={year.year}>{year.year}</option>
                    ))}
                </select>
              </div>
              {monthly.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B08968]"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#B08968]/20">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Month</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Income</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Expenses</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.data.map((month, index) => (
                        <motion.tr 
                          key={month.month}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-[#B08968]/20 hover:bg-white/50"
                        >
                          <td className="px-6 py-4 text-sm text-[#9C6644]">{monthNames[month.month - 1]}</td>
                          <td className="px-6 py-4 text-sm text-green-600">₹{(month.income || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-red-500">₹{(month.expenses || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-[#9C6644]">₹{(month.balance || 0).toFixed(2)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'yearly' && (
            <>
              <h2 className="text-2xl font-bold text-[#7F5539] mb-6">Yearly Breakdown</h2>
              {yearly.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B08968]"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#B08968]/20">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Year</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Income</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Expenses</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#7F5539]">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearly.data.map((year, index) => (
                        <motion.tr 
                          key={year.year}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-[#B08968]/20 hover:bg-white/50"
                        >
                          <td className="px-6 py-4 text-sm text-[#9C6644]">{year.year}</td>
                          <td className="px-6 py-4 text-sm text-green-600">₹{(year.income || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-red-500">₹{(year.expenses || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-[#9C6644]">₹{(year.balance || 0).toFixed(2)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;