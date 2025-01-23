import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../store/slice/authSlice";
import {
  fetchMonthlyExpenses,
  fetchIncomeVsExpense,
  fetchCategoryExpenses,
} from "../store/slice/analyticsSlice";
import { fetchBalanceSummary } from "../store/slice/balanceSheetSlice";
import {
  fetchProjects,
  createProject,
  selectProject,
  deleteProject,
} from "../store/slice/projectSlice";
import { Menu, X, Plus, Trash2, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
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

const ProjectList = React.memo(({ projects, selectedProject, onSelectProject, onDeleteProject }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-2"
  >
    {projects.map((project) => (
      <motion.div
        key={project._id}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between p-3 rounded-lg ${
          selectedProject?._id === project._id ? 'bg-[#B08968] text-white' : 'bg-white'
        }`}
      >
        <span onClick={() => onSelectProject(project)} className="flex-1 cursor-pointer">
          {project.name}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDeleteProject(project._id)}
          className="ml-2"
        >
          <Trash2 size={20} />
        </motion.button>
      </motion.div>
    ))}
  </motion.div>
));

const FinancialSummary = React.memo(({ summary, selectedProject }) => {
  // Ensure values are numbers and default to 0 if undefined
  const budget = Number(selectedProject?.budget) || 0;
  const totalIncome = Number(summary?.totalIncome) || 0;
  const totalExpenses = Number(summary?.totalExpenses) || 0;
  const netBalance = Number(summary?.netBalance) || 0;
  
  // Calculate remaining payment as (budget - totalIncome)
  // This shows how much of the budget is still to be received
  const remainingPayment = Math.max(budget - totalIncome, 0);
  
  const cards = [
    {
      title: "Budget",
      value: budget,
      gradient: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
      textColor: "text-blue-700"
    },
    {
      title: "Total Expenses",
      value: totalExpenses,
      gradient: "from-red-50 to-red-100/50",
      border: "border-red-200",
      textColor: "text-red-700"
    },
    {
      title: "Payment Received",
      value: totalIncome,
      gradient: "from-teal-50 to-teal-100/50",
      border: "border-teal-200",
      textColor: "text-teal-700"
    },
    {
      title: "Remaining Payment",
      value: remainingPayment,
      gradient: "from-amber-50 to-amber-100/50",
      border: "border-amber-200",
      textColor: "text-amber-700"
    },
    {
      title: "Net Balance",
      value: netBalance,
      gradient: "from-purple-50 to-purple-100/50",
      border: "border-purple-200",
      textColor: "text-purple-700"
    }
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-white/70 rounded-xl p-6 shadow-lg"
    >
      <motion.h2
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        className="text-2xl font-bold text-[#7F5539] mb-6"
      >
        Financial Summary
      </motion.h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl border ${card.border} shadow-md backdrop-blur-md`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{card.title}</h3>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`text-3xl font-bold ${card.textColor}`}
            >
              ₹{card.value.toFixed(2)}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
});

const Charts = React.memo(({ monthlyExpenses, incomeVsExpense, colorPalette }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
    <motion.section
      variants={itemVariants}
      className="bg-white/80 rounded-xl p-4 transform hover:shadow-lg transition-all duration-300"
    >
      <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Monthly Expenses</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart data={monthlyExpenses} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id.month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#B08968" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>

    <motion.section
      variants={itemVariants}
      className="bg-white/80 rounded-xl p-4 transform hover:shadow-lg transition-all duration-300"
    >
      <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Income vs Expense</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={incomeVsExpense}
              dataKey="total"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {incomeVsExpense.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  </motion.div>
));

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
      Promise.all([
        dispatch(fetchMonthlyExpenses({ userId, projectId })),
        dispatch(fetchIncomeVsExpense({ userId, projectId })),
        dispatch(fetchCategoryExpenses({ userId, projectId })),
        dispatch(fetchBalanceSummary(userId))
      ]);
    }
  }, [dispatch, userId, selectedProject]);

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
      await dispatch(deleteProject({ projectId, userId })).unwrap();
      showToast("Project deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete project", "error");
    }
  }, [dispatch, userId, showToast]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pb-24">
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

        <section className="bg-white/80 rounded-xl p-4 mb-6">
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
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
          />
        </section>

        {selectedProject && (
          <>
            <FinancialSummary summary={balanceSummary} selectedProject={selectedProject} />
            <Charts
              monthlyExpenses={monthlyExpenses}
              incomeVsExpense={incomeVsExpense}
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
                dispatch(fetchBalanceSummary(userId));
              }
            }} />
          )}
        </Suspense>
      </main>
    </div>
  );
};

export default React.memo(Dashboard);