import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchBalanceSummary,
  fetchTotalCalculations,
  fetchProjectDetails,
  generateBalanceSheetPDF,
  toggleSelectedItem
} from '../../store/slice/balanceSheetSlice';
import { selectProject } from '../../store/slice/projectSlice';
import Navbar from "../../pages/Navbar";

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const projects = useSelector((state) => state.projects.projects);
  const { 
    summary, 
    totalCalculations, 
    projectDetails, 
    pdfGeneration,
    selectedItems,
    loading 
  } = useSelector((state) => state.balanceSheet);
  
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

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!selectedProject?._id || !userId || selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    try {
      await dispatch(generateBalanceSheetPDF({
        userId,
        projectId: selectedProject._id,
        selectedItems
      })).unwrap();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Handle item selection
  const handleItemToggle = (item) => {
    dispatch(toggleSelectedItem(item));
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
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#7F5539] mb-2">Balance Sheet</h1>
                <p className="text-[#9C6644] text-sm">
                  Select items to include in your PDF report
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={selectedProject?._id || ''}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-[#DDB892] bg-white/50 text-[#7F5539] focus:outline-none focus:border-[#7F5539] transition-colors"
                >
                  <option value="">Select Project</option>
                  {projects?.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGeneratePDF}
                  disabled={selectedItems.length === 0 || pdfGeneration.loading}
                  className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition-all ${
                    selectedItems.length === 0 || pdfGeneration.loading
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-[#7F5539] hover:bg-[#9C6644] hover:shadow-lg'
                  }`}
                >
                  {pdfGeneration.loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Generate PDF ({selectedItems.length} selected)
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {projectDetails?.data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-green-50/80 backdrop-blur-sm p-6 rounded-xl shadow-md border-2 border-green-200"
              >
                <h3 className="text-green-800 text-sm font-medium mb-2">Total Income</h3>
                <p className="text-2xl font-bold text-green-900">₹{projectDetails.data.summary.totalIncome.toFixed(2)}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-red-50/80 backdrop-blur-sm p-6 rounded-xl shadow-md border-2 border-red-200"
              >
                <h3 className="text-red-800 text-sm font-medium mb-2">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-900">₹{projectDetails.data.summary.totalExpenses.toFixed(2)}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-blue-50/80 backdrop-blur-sm p-6 rounded-xl shadow-md border-2 border-blue-200"
              >
                <h3 className="text-blue-800 text-sm font-medium mb-2">Net Balance</h3>
                <p className="text-2xl font-bold text-blue-900">₹{projectDetails.data.summary.netBalance.toFixed(2)}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-purple-50/80 backdrop-blur-sm p-6 rounded-xl shadow-md border-2 border-purple-200"
              >
                <h3 className="text-purple-800 text-sm font-medium mb-2">Budget Remaining</h3>
                <p className="text-2xl font-bold text-purple-900">₹{projectDetails.data.summary.budgetRemaining.toFixed(2)}</p>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Categories */}
            {projectDetails?.data && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#7F5539] mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Income Categories
                </h3>

                <div className="space-y-6">
                  {projectDetails.data.income.categories.map((category) => (
                    <div key={category.category} className="bg-green-50/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-green-800">{category.category}</h4>
                        <span className="text-sm font-medium text-green-600">
                          Total: ₹{category.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {category.entries.map((entry) => (
                          <motion.div
                            key={entry._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleItemToggle({
                              id: entry._id,
                              type: 'Income',
                              category: category.category,
                              ...entry
                            })}
                            className={`cursor-pointer rounded-lg border-2 transition-all ${
                              selectedItems.some(item => item.id === entry._id)
                                ? 'bg-green-100 border-green-500 shadow-md'
                                : 'bg-white/80 border-green-200 hover:border-green-300'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-green-900">{entry.description}</p>
                                  <p className="text-sm text-green-600 mt-1">
                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <p className="font-semibold text-green-700">₹{entry.amount.toFixed(2)}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Categories */}
            {projectDetails?.data && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#7F5539] mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  Expense Categories
                </h3>

                <div className="space-y-6">
                  {projectDetails.data.expenses.categories.map((category) => (
                    <div key={category.category} className="bg-red-50/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-red-800">{category.category}</h4>
                        <span className="text-sm font-medium text-red-600">
                          Total: ₹{category.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {category.entries.map((entry) => (
                          <motion.div
                            key={entry._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleItemToggle({
                              id: entry._id,
                              type: 'Expense',
                              category: category.category,
                              ...entry
                            })}
                            className={`cursor-pointer rounded-lg border-2 transition-all ${
                              selectedItems.some(item => item.id === entry._id)
                                ? 'bg-red-100 border-red-500 shadow-md'
                                : 'bg-white/80 border-red-200 hover:border-red-300'
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-red-900">{entry.description}</p>
                                  <p className="text-sm text-red-600 mt-1">
                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <p className="font-semibold text-red-700">₹{entry.amount.toFixed(2)}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pdfGeneration.error && (
            <div className="mt-6 p-4 bg-red-100 text-red-600 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Error generating PDF: {pdfGeneration.error}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BalanceSheet;