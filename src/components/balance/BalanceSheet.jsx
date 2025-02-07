import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchBalanceSummary,
  fetchTotalCalculations,
  fetchProjectDetails,
} from '../../store/slice/balanceSheetSlice';
import { selectProject } from '../../store/slice/projectSlice';
import Navbar from "../../pages/Navbar";

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const projects = useSelector((state) => state.projects.projects);
  const { summary, totalCalculations, projectDetails, loading } = useSelector((state) => state.balanceSheet);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchTotalCalculations(userId));
      if (selectedProject?._id) {
        dispatch(fetchBalanceSummary(userId));
        dispatch(fetchProjectDetails({ userId, projectId: selectedProject._id }));
      }
    }
  }, [dispatch, userId, selectedProject?._id]);

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      dispatch(selectProject(project));
      localStorage.setItem('selectedProject', JSON.stringify(project));
    }
  };

  // Loading skeleton animation
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F5EBE0] pt-16 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <LoadingSkeleton />
          </div>
        </div>
      </>
    );
  }

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

  if (summary.error || totalCalculations.error || projectDetails.error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex items-center justify-center">
          <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
            <p className="text-red-600">Error loading data: {summary.error || totalCalculations.error || projectDetails.error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5EBE0] pt-16 pb-20 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header with fade-in animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-[#7F5539]">Balance Sheet</h1>
                <p className="text-sm text-[#9C6644]">Track your financial overview</p>
              </div>
              <div className="w-64">
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#B08968] bg-white text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Project Details Section with slide-up animation */}
          {selectedProject && projectDetails.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#7F5539]">{projectDetails.data.projectDetails.name}</h2>
                <p className="text-sm text-[#9C6644]">{projectDetails.data.projectDetails.description}</p>
              </div>

              {/* Project Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm text-green-700">Total Income</h3>
                  <p className="text-xl font-bold text-green-600">₹{projectDetails.data.summary.totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm text-red-700">Total Expenses</h3>
                  <p className="text-xl font-bold text-red-600">₹{projectDetails.data.summary.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm text-blue-700">Net Balance</h3>
                  <p className="text-xl font-bold text-blue-600">₹{projectDetails.data.summary.netBalance.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm text-purple-700">Budget Remaining</h3>
                  <p className="text-xl font-bold text-purple-600">₹{projectDetails.data.summary.budgetRemaining.toFixed(2)}</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Income Categories</h3>
                  {projectDetails.data.income.categories.map((category, index) => (
                    <div key={index} className="mb-3 bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800">{category.category}</span>
                        <span className="font-semibold text-green-600">₹{category.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expense Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Expense Categories</h3>
                  {projectDetails.data.expenses.categories.map((category, index) => (
                    <div key={index} className="mb-3 bg-red-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-red-800">{category.category}</span>
                        <span className="font-semibold text-red-600">₹{category.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Overall Summary Section with fade-in animation */}
          {totalCalculations.data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-[#7F5539] mb-4">Overall Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm text-green-700">Total Income</h3>
                  <p className="text-xl font-bold text-green-600">
                    ₹{totalCalculations.data.summary.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm text-red-700">Total Expenses</h3>
                  <p className="text-xl font-bold text-red-600">
                    ₹{totalCalculations.data.summary.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm text-blue-700">Net Balance</h3>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{totalCalculations.data.summary.netBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default BalanceSheet;