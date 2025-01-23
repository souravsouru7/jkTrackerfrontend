import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchBalanceSummary,
  fetchMonthlyBreakdown,
  fetchYearlyBreakdown,
} from '../../store/slice/balanceSheetSlice';
import Navbar from "../../pages/Navbar";

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
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
          <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-[#7F5539] mb-4">Select a Project</h2>
            <p className="text-[#9C6644]">Please select a project from the dashboard to view its balance sheet.</p>
          </div>
        </div>
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
          <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
            <p className="text-[#7F5539]">Please log in to view the balance sheet.</p>
          </div>
        </div>
      </>
    );
  }

  if (summary.error || monthly.error || yearly.error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
          <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
            <p className="text-red-600">Error loading data: {summary.error || monthly.error || yearly.error}</p>
          </div>
        </div>
      </>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5EBE0] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-[#7F5539]">
              Balance Sheet
            </h1>
            <p className="text-sm text-[#9C6644]">Track your financial overview</p>
          </div>

          {/* Overall Summary Section */}
          <div className="bg-[#F5EBE0]/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Overall Summary</h2>
            {summary.loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B08968]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm text-[#7F5539] mb-1">Total Income</h3>
                  <p className="text-2xl font-bold text-green-600">₹{(summary.totalIncome || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm text-[#7F5539] mb-1">Total Expenses</h3>
                  <p className="text-2xl font-bold text-red-500">₹{(summary.totalExpenses || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm text-[#7F5539] mb-1">Net Balance</h3>
                  <p className="text-2xl font-bold text-[#9C6644]">₹{(summary.netBalance || 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'monthly'
                  ? 'bg-[#B08968] text-white'
                  : 'bg-white text-[#7F5539] hover:bg-[#B08968]/10'
              }`}
            >
              Monthly Breakdown
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'yearly'
                  ? 'bg-[#B08968] text-white'
                  : 'bg-white text-[#7F5539] hover:bg-[#B08968]/10'
              }`}
            >
              Yearly Breakdown
            </button>
          </div>

          {/* Content Section */}
          <div className="bg-[#F5EBE0]/50 rounded-lg p-4 sm:p-6">
            {activeTab === 'monthly' && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-lg font-semibold text-[#7F5539]">Monthly Breakdown</h2>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-md text-sm text-[#7F5539] border border-[#B08968]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                  >
                    {(yearly.data.length > 0 ? yearly.data : [{ year: new Date().getFullYear() }])
                      .map((year) => (
                        <option key={year.year} value={year.year}>{year.year}</option>
                      ))}
                  </select>
                </div>
                {monthly.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B08968]"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#B08968]/20">
                          <th className="py-3 pl-6 pr-4 text-left text-sm font-medium text-[#7F5539]">Month</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Income</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Expenses</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthly.data.map((month, index) => (
                          <tr 
                            key={month.month}
                            className="border-b border-[#B08968]/10 hover:bg-white/50"
                          >
                            <td className="py-3 pl-6 pr-4 text-sm text-[#9C6644]">{monthNames[month.month - 1]}</td>
                            <td className="p-3 text-sm text-green-600">₹{(month.income || 0).toFixed(2)}</td>
                            <td className="p-3 text-sm text-red-500">₹{(month.expenses || 0).toFixed(2)}</td>
                            <td className="p-3 text-sm text-[#9C6644]">₹{(month.balance || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'yearly' && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#7F5539]">Yearly Breakdown</h2>
                </div>
                {yearly.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B08968]"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#B08968]/20">
                          <th className="py-3 pl-6 pr-4 text-left text-sm font-medium text-[#7F5539]">Year</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Income</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Expenses</th>
                          <th className="p-3 text-left text-sm font-medium text-[#7F5539]">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearly.data.map((year, index) => (
                          <tr 
                            key={year.year}
                            className="border-b border-[#B08968]/10 hover:bg-white/50"
                          >
                            <td className="py-3 pl-6 pr-4 text-sm text-[#9C6644]">{year.year}</td>
                            <td className="p-3 text-sm text-green-600">₹{(year.income || 0).toFixed(2)}</td>
                            <td className="p-3 text-sm text-red-500">₹{(year.expenses || 0).toFixed(2)}</td>
                            <td className="p-3 text-sm text-[#9C6644]">₹{(year.balance || 0).toFixed(2)}</td>
                          </tr>
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
    </>
  );
};

export default BalanceSheet;