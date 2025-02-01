import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../store/slice/authSlice";
import {
  fetchMonthlyExpenses,
  fetchIncomeVsExpense,
  fetchCategoryExpenses,
  fetchCategoryAnalysis,
} from "../store/slice/analyticsSlice";
import { fetchBalanceSummary } from "../store/slice/balanceSheetSlice";
import {
  fetchProjects,
  createProject,
  selectProject,
  deleteProject,
  updateProjectBudget,
} from "../store/slice/projectSlice";
import { fetchEntries } from '../store/slice/entrySlice';
import { Menu, X, Plus, Trash2, ChevronRight, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area,
  RadialBarChart, RadialBar
} from "recharts";
import { fetchFinancialSummary } from '../store/slice/fincialSlice';
import FinancialOverview from './FinancialOverview';
import Navbar from './Navbar';

const EntryForm = lazy(() => import("../components/addentry/EntryForm"));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const MobileHeader = React.memo(({ isOpen, setIsOpen }) => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-[#B08968]/20"
  >
    <div className="flex justify-between items-center px-4 py-4">
      <motion.h1
        whileHover={{ scale: 1.05 }}
        className="text-xl font-bold text-[#7F5539]"
      >
        Finance Tracker
      </motion.h1>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#7F5539]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>
    </div>
  </motion.header>
));

const MobileMenu = React.memo(({ isOpen, setIsOpen, navigate, dispatch }) => {
  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsOpen(false);
  }, [navigate, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 bg-white z-40 flex flex-col"
        >
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(false)}
            >
              <X size={24} className="text-[#7F5539]" />
            </motion.button>
          </div>
          <nav className="flex flex-col p-4 gap-4">
            {["Entries", "Balance Sheet", "Create Bill"].map((item, index) => (
              <motion.button
                key={item}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                onClick={() => handleNavigation(`/${item.toLowerCase().replace(' ', '-')}`)}
                className="w-full py-3 text-left text-[#9C6644] text-lg flex items-center justify-between"
              >
                {item}
                <ChevronRight size={20} />
              </motion.button>
            ))}
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(logout())}
              className="w-full py-3 bg-[#B08968] text-white rounded-lg text-lg mt-4"
            >
              Logout
            </motion.button>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const ProjectList = React.memo(({ projects, onDelete, onSelect, selectedProject }) => {
  const dispatch = useDispatch();
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetValue, setBudgetValue] = useState("");
  const [showActions, setShowActions] = useState(null);

  const handleBudgetEdit = (project) => {
    setEditingBudget(project._id);
    setBudgetValue(project.budget.toString());
    setShowActions(null);
  };

  const handleBudgetSave = async (projectId) => {
    if (budgetValue.trim() && !isNaN(budgetValue)) {
      try {
        await dispatch(updateProjectBudget({ projectId, budget: Number(budgetValue) })).unwrap();
        setEditingBudget(null);
      } catch (error) {
        console.error('Failed to update budget:', error);
      }
    }
  };

  const handleBudgetCancel = () => {
    setEditingBudget(null);
    setBudgetValue("");
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.project-actions')) {
        setShowActions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <motion.div variants={containerVariants} className="space-y-4">
      {projects.map((project) => (
        <motion.div
          key={project._id}
          variants={itemVariants}
          className={`p-4 rounded-lg shadow-md relative ${
            selectedProject?._id === project._id
              ? "bg-[#B08968]/20 border-2 border-[#B08968]"
              : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1" onClick={() => onSelect(project)}>
              <h3 className="text-lg font-semibold text-[#7F5539]">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
              
              {editingBudget === project._id ? (
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    className="px-2 py-1 border rounded-md text-sm w-32"
                    placeholder="Enter budget"
                  />
                  <button
                    onClick={() => handleBudgetSave(project._id)}
                    className="px-2 py-1 bg-green-500 text-white rounded-md text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleBudgetCancel}
                    className="px-2 py-1 bg-gray-500 text-white rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  Budget: ${project.budget.toLocaleString()}
                </p>
              )}
            </div>
            
            {selectedProject?._id === project._id && (
              <div className="relative project-actions">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(showActions === project._id ? null : project._id);
                  }}
                  className="p-2 text-[#B08968] hover:text-[#7F5539]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </motion.button>

                {showActions === project._id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
                  >
                    <button
                      onClick={() => handleBudgetEdit(project)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Budget
                    </button>
                    <button
                      onClick={() => onDelete(project._id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete Project
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});

const FinancialSummary = React.memo(({ summary }) => {
  const cards = [
    {
      title: "Total Balance",
      value: summary?.totalBalance || 0,
      gradient: "from-[#B08968] to-[#9C6644]",
      icon: <DollarSign className="w-8 h-8 text-white/80" />,
      onClick: () => {}
    },
    {
      title: "Total Income",
      value: summary?.totalIncome || 0,
      gradient: "from-[#9C6644] to-[#7F5539]",
      icon: <TrendingUp className="w-6 h-6 text-white/80" />,
      onClick: () => {}
    },
    {
      title: "Total Expenses",
      value: summary?.totalExpenses || 0,
      gradient: "from-[#7F5539] to-[#B08968]",
      icon: <TrendingDown className="w-6 h-6 text-white/80" />,
      onClick: () => {}
    }
  ];

  return (
    <div className="p-4">
      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {/* Large Total Balance Card */}
        <motion.div
          variants={cardVariants}
          className={`p-6 rounded-xl bg-gradient-to-r from-[#B08968] to-[#9C6644] text-white`}
        >
          <div className="flex justify-between items-start mb-2">
          <div>
                <p className="text-sm font-medium opacity-90">Total Income</p>
                <h3 className="text-xl font-bold mt-1">
                  ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}
                </h3>
              </div>
            <DollarSign className="w-8 h-8 text-white/80" />
          </div>
          <button className="mt-4 text-sm text-white/80 flex items-center gap-1">
            View Details <ChevronRight size={16} />
          </button>
        </motion.div>

        {/* Income and Expense Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            variants={cardVariants}
            className="p-4 rounded-xl bg-gradient-to-r from-[#9C6644] to-[#7F5539] text-white"
          >
            <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium opacity-90">Total Balance</p>
              <h3 className="text-4xl font-bold mt-2">
                ₹{(summary?.totalBalance || 0).toLocaleString('en-IN')}
              </h3>
            </div>
              
              <TrendingUp className="w-6 h-6 text-white/80" />
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="p-4 rounded-xl bg-gradient-to-r from-[#7F5539] to-[#B08968] text-white"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium opacity-90">Total Expenses</p>
                <h3 className="text-xl font-bold mt-1">
                  ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <TrendingDown className="w-6 h-6 text-white/80" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop View - remains unchanged */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className={`p-6 rounded-xl bg-gradient-to-r ${card.gradient} text-white`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold mt-2">
                  ₹{card.value.toLocaleString('en-IN')}
                </h3>
              </div>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

const Charts = React.memo(({ monthlyExpenses, incomeVsExpense, categoryAnalysis, colorPalette }) => {
  // Format currency for tooltips
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Check if data is available
  const hasMonthlyData = monthlyExpenses && monthlyExpenses.length > 0;
  const hasIncomeExpenseData = incomeVsExpense && incomeVsExpense.length > 0;
  const hasCategoryAnalysisData = categoryAnalysis && categoryAnalysis.length > 0;

  // Modern Mobile Charts
  const MobileCharts = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    
    return (
      <div className="space-y-4 p-2">
        {/* Financial Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-lg p-4"
        >
          <h2 className="text-xl font-semibold text-[#7F5539] mb-2">Financial Summary</h2>
          <p className="text-sm text-gray-600 mb-4">Track your overall expenses and income</p>
        </motion.div>

        {/* Monthly Expenses Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-lg p-3"
        >
          <h3 className="text-base font-semibold text-[#7F5539] mb-2">Monthly Expenses</h3>
          <div className="h-[180px]">
            {!hasMonthlyData ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={10}
                    tick={{ fill: '#7F5539' }}
                  />
                  <YAxis 
                    fontSize={10}
                    tickFormatter={formatCurrency}
                    tick={{ fill: '#7F5539' }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), "Amount"]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="amount" name="Expenses" fill="#B08968" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Income vs Expense Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-lg p-3"
        >
          <h3 className="text-base font-semibold text-[#7F5539] mb-2">Income vs Expense</h3>
          <div className="h-[200px]">
            {!hasIncomeExpenseData ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No income/expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeVsExpense}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#B08968"
                  >
                    {incomeVsExpense.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Income' ? '#4CAF50' : '#F44336'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Amount"]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Category Analysis Chart */}
        {hasCategoryAnalysisData && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-lg p-3"
          >
            <h3 className="text-base font-semibold text-[#7F5539] mb-2">Category Analysis</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryAnalysis}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#B08968"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  >
                    {categoryAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Desktop Charts
  const DesktopCharts = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    
    return (
      <div className="grid grid-cols-2 gap-6 p-6">
        {/* Monthly Expenses Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg p-6 shadow-sm h-[400px]"
        >
          <h3 className="text-lg font-semibold text-[#7F5539] mb-4">Monthly Expenses</h3>
          {!hasMonthlyData ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="amount" name="Expenses" fill="#B08968" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Income vs Expense Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg p-6 shadow-sm h-[400px]"
        >
          <h3 className="text-lg font-semibold text-[#7F5539] mb-4">Income vs Expense</h3>
          {!hasIncomeExpenseData ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No income/expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeVsExpense}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#B08968"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {incomeVsExpense.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Income' ? '#4CAF50' : '#F44336'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category Analysis Chart */}
        {hasCategoryAnalysisData && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-lg p-6 col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryAnalysis}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    tick={{ fontSize: 14 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#B08968"
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                  >
                    {categoryAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#DDB892]/10"
    >
      <div className="p-4">
        <div className="block md:hidden">
          <MobileCharts />
        </div>
        <div className="hidden md:block">
          <DesktopCharts />
        </div>
      </div>
    </motion.div>
  );
});

const Toast = React.memo(({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 left-4 right-4 p-4 rounded-lg ${
      type === "success" ? "bg-[#B08968]" : "bg-red-500"
    } text-white z-50`}
  >
    {message}
  </motion.div>
));

const Dashboard = () => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [newProjectBudget, setNewProjectBudget] = useState("");

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { overall } = useSelector(state => state.summary);

  // Memoized values
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const userId = useMemo(() => user?._id || user?.id, [user]);
  const colorPalette = useMemo(() => [
    "#E6CCB2", "#DDB892", "#B08968", "#7F5539", "#9C6644", "#764134"
  ], []);

  // Selectors
  const projects = useSelector((state) => state.projects.projects);
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const monthlyExpenses = useSelector((state) => state.analytics.monthlyExpenses);
  const incomeVsExpense = useSelector((state) => state.analytics.incomeVsExpense);
  const categoryAnalysis = useSelector((state) => state.analytics.categoryAnalysis);
  const balanceSummary = useSelector((state) => state.balanceSheet.summary);

  // Effects
  useEffect(() => {
    if (userId) {
      dispatch(fetchFinancialSummary(userId));
      const savedProject = localStorage.getItem('selectedProject');
      if (savedProject) {
        dispatch(selectProject(JSON.parse(savedProject)));
      }
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchProjects(userId));
    } else {
      navigate("/login");
    }
  }, [dispatch, userId, navigate]);

  useEffect(() => {
    if (selectedProject && userId) {
      const projectId = selectedProject._id;
      console.log('Fetching data for project:', projectId);
      
      // Fetch all data in parallel
      Promise.all([
        dispatch(fetchMonthlyExpenses({ userId, projectId }))
          .then(res => console.log('Monthly Expenses:', res.payload)),
        dispatch(fetchIncomeVsExpense({ userId, projectId }))
          .then(res => console.log('Income vs Expense:', res.payload)),
        dispatch(fetchCategoryExpenses({ userId, projectId }))
          .then(res => console.log('Category Expenses:', res.payload)),
        dispatch(fetchCategoryAnalysis({ userId, projectId }))
          .then(res => console.log('Category Analysis:', res.payload)),
        dispatch(fetchBalanceSummary(userId))
          .then(res => console.log('Balance Summary:', res.payload))
      ]).catch(error => {
        console.error('Error fetching data:', error);
        showToast("Failed to fetch data", "error");
      });
    }
  }, [dispatch, userId, selectedProject]);

  useEffect(() => {
    console.log('Monthly Expenses updated:', monthlyExpenses);
    console.log('Income vs Expense updated:', incomeVsExpense);
  }, [monthlyExpenses, incomeVsExpense]);

  // Callbacks
  const showToast = useCallback((message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName) return;

    try {
      await dispatch(createProject({
        userId,
        name: newProjectName,
        description: newProjectDescription,
        budget: newProjectBudget
      })).unwrap();
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectBudget("");
      showToast("Project created successfully", "success");
    } catch (error) {
      showToast("Failed to create project", "error");
    }
  }, [dispatch, userId, newProjectName, newProjectDescription, newProjectBudget, showToast]);

  const handleDeleteProject = useCallback(async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await dispatch(deleteProject(projectId)).unwrap();
      
      // Clear selected project if it was deleted
      if (selectedProject?._id === projectId) {
        dispatch(selectProject(null));
        localStorage.removeItem('selectedProject');
      }
      
      // Refresh projects list
      dispatch(fetchProjects(userId));
      
      showToast("Project deleted successfully", "success");
    } catch (error) {
      console.error('Delete project error:', error);
      showToast("Failed to delete project", "error");
    }
  }, [dispatch, userId, selectedProject, showToast]);

  const handleSelectProject = useCallback((project) => {
    dispatch(selectProject(project));
    localStorage.setItem('selectedProject', JSON.stringify(project));
  }, [dispatch]);

  const refreshData = useCallback(() => {
    if (userId) {
      dispatch(fetchFinancialSummary(userId));
      if (selectedProject) {
        const projectId = selectedProject._id;
        Promise.all([
          dispatch(fetchMonthlyExpenses({ userId, projectId })),
          dispatch(fetchIncomeVsExpense({ userId, projectId })),
          dispatch(fetchCategoryExpenses({ userId, projectId })),
          dispatch(fetchCategoryAnalysis({ userId, projectId })),
          dispatch(fetchBalanceSummary(userId))
        ]);
      }
    }
  }, [dispatch, userId, selectedProject]);

  const handleEntryModalClose = useCallback(() => {
    setIsEntryModalOpen(false);
    refreshData();
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <Navbar />
      <div className="md:hidden h-14" /> {/* Spacer for mobile header */}
      <div className="container mx-auto px-4 pt-4 pb-20 md:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#7F5539]">Financial Summary</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your overall expenses and income across all projects
            </p>
          </div>

          <div className="bg-white/80 rounded-xl p-6 shadow-lg backdrop-blur-sm mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#7F5539]">Income & Expense Overview</h2>
              <p className="text-sm text-gray-500">Current financial status</p>
            </div>
            <FinancialOverview overall={overall} />
          </div>

          <section className="hidden md:block bg-white/80 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Create Project</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <input
                type="text"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <input
                type="number"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(e.target.value)}
                placeholder="Budget"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
              />
              <button
                onClick={handleCreateProject}
                className="w-full py-3 bg-[#B08968] text-white rounded-lg"
              >
                Create Project
              </button>
            </div>
          </section>

          <section className="bg-white/80 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Your Projects</h2>
            <ProjectList
              projects={projects}
              onDelete={handleDeleteProject}
              onSelect={handleSelectProject}
              selectedProject={selectedProject}
            />
          </section>

          {selectedProject && (
            <>
              <FinancialSummary summary={balanceSummary} />
              <Charts
                monthlyExpenses={monthlyExpenses}
                incomeVsExpense={incomeVsExpense}
                categoryAnalysis={categoryAnalysis}
                colorPalette={colorPalette}
              />
            </>
          )}

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#B08968] text-white rounded-full shadow-xl flex items-center justify-center"
          >
            <Plus size={24} />
          </button>

          <AnimatePresence>
            {showNotification && (
              <Toast message={notificationMessage} type={notificationType} />
            )}
          </AnimatePresence>

          <Suspense fallback={<div>Loading...</div>}>
            {isEntryModalOpen && (
              <EntryForm onClose={handleEntryModalClose} projectId={selectedProject?._id} onSuccess={() => {
                setIsEntryModalOpen(false);
                showToast("Entry added successfully", "success");
                // Refresh data
                if (selectedProject && userId) {
                  const projectId = selectedProject._id;
                  dispatch(fetchMonthlyExpenses({ userId, projectId }));
                  dispatch(fetchIncomeVsExpense({ userId, projectId }));
                  dispatch(fetchCategoryExpenses({ userId, projectId }));
                  dispatch(fetchCategoryAnalysis({ userId, projectId }));
                  dispatch(fetchBalanceSummary(userId));
                }
              }} />
            )}
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);