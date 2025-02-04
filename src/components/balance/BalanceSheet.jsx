import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchBalanceSummary,
  fetchTotalCalculations,
  fetchProjectDetails,
} from '../../store/slice/balanceSheetSlice';
import Navbar from "../../pages/Navbar";

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const { summary, totalCalculations, projectDetails } = useSelector((state) => state.balanceSheet);
  
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
      <div className="min-h-screen bg-[#F5EBE0] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-[#7F5539]">Balance Sheet</h1>
            <p className="text-sm text-[#9C6644]">Track your financial overview</p>
          </div>

          {/* Project Details Section */}
          {selectedProject && projectDetails.data && (
            <div className="bg-white rounded-lg shadow-md p-6">
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
            </div>
          )}

          {/* Overall Summary Section */}
          {totalCalculations.data && (
            <div className="bg-white rounded-lg shadow-md p-6">
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BalanceSheet;