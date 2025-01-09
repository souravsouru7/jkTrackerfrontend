import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
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
import { Menu, X, Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

// Lazy loaded components
const EntryForm = lazy(() => import("../components/addentry/EntryForm"));

// Component for mobile header
const MobileHeader = React.memo(({ isOpen, setIsOpen }) => (
  <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-[#B08968]/20">
    <div className="flex justify-between items-center px-4 py-4">
      <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
      <button onClick={() => setIsOpen(!isOpen)} className="text-[#7F5539]">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  </header>
));

// Component for mobile menu
const MobileMenu = React.memo(({ isOpen, setIsOpen, navigate, dispatch }) => {
  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsOpen(false);
  }, [navigate, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <div className="flex justify-between items-center px-4 py-4 border-b">
        <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
        <button onClick={() => setIsOpen(false)}>
          <X size={24} className="text-[#7F5539]" />
        </button>
      </div>
      <nav className="flex flex-col p-4 gap-4">
        <button
          onClick={() => handleNavigation("/entries")}
          className="w-full py-3 text-left text-[#9C6644] text-lg"
        >
          Entries
        </button>
        <button
          onClick={() => handleNavigation("/balance-sheet")}
          className="w-full py-3 text-left text-[#9C6644] text-lg"
        >
          Balance Sheet
        </button>
        <button
          onClick={() => handleNavigation("/create-bill")}
          className="w-full py-3 text-left text-[#9C6644] text-lg"
        >
          Create Bill
        </button>
        <button
          onClick={() => dispatch(logout())}
          className="w-full py-3 bg-[#B08968] text-white rounded-lg text-lg"
        >
          Logout
        </button>
      </nav>
    </div>
  );
});

// Component for project list
const ProjectList = React.memo(({ projects, selectedProject, onSelectProject, onDeleteProject }) => (
  <div className="space-y-2">
    {projects.map((project) => (
      <div
        key={project._id}
        className={`flex items-center justify-between p-3 rounded-lg ${
          selectedProject?._id === project._id ? 'bg-[#B08968] text-white' : 'bg-white'
        }`}
      >
        <span onClick={() => onSelectProject(project)} className="flex-1 cursor-pointer">
          {project.name}
        </span>
        <button onClick={() => onDeleteProject(project._id)} className="ml-2">
          <Trash2 size={20} />
        </button>
      </div>
    ))}
  </div>
));

// Component for financial summary
const FinancialSummary = React.memo(({ summary }) => (
  <section className="bg-white/80 rounded-xl p-4">
    <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Financial Summary</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
      >
        <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Total Income</h3>
        <p className="text-3xl font-bold text-green-600">
          ₹{(summary.totalIncome || 0).toFixed(2)}
        </p>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
      >
        <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Total Expenses</h3>
        <p className="text-3xl font-bold text-red-500">
          ₹{(summary.totalExpenses || 0).toFixed(2)}
        </p>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 backdrop-blur-md"
      >
        <h3 className="text-lg font-semibold text-[#7F5539] mb-2">Net Balance</h3>
        <p className="text-3xl font-bold text-[#9C6644]">
          ₹{(summary.netBalance || 0).toFixed(2)}
        </p>
      </motion.div>
    </div>
  </section>
));

// Component for charts
const Charts = React.memo(({ monthlyExpenses, incomeVsExpense, colorPalette }) => (
  <>
    <section className="bg-white/80 rounded-xl p-4">
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
    </section>

    <section className="bg-white/80 rounded-xl p-4">
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
    </section>
  </>
));

// Toast notification component
const Toast = React.memo(({ message, type }) => (
  <div
    className={`fixed bottom-4 left-4 right-4 p-4 rounded-lg ${
      type === "success" ? "bg-[#B08968]" : "bg-red-500"
    } text-white z-50`}
  >
    {message}
  </div>
));

// Main Dashboard component
const Dashboard = () => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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
      })).unwrap();
      setNewProjectName("");
      setNewProjectDescription("");
      showToast("Project created successfully", "success");
    } catch (error) {
      showToast("Failed to create project", "error");
    }
  }, [dispatch, userId, newProjectName, newProjectDescription, showToast]);

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
  }, [dispatch]);

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} />
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navigate={navigate}
        dispatch={dispatch}
      />

      <main className="p-4 space-y-6">
        <section className="bg-white/80 rounded-xl p-4">
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
            <button
              onClick={handleCreateProject}
              className="w-full py-3 bg-[#B08968] text-white rounded-lg"
            >
              Create Project
            </button>
          </div>
        </section>

        <section className="bg-white/80 rounded-xl p-4">
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
            <FinancialSummary summary={balanceSummary} />
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

        {isEntryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl relative">
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="absolute top-4 right-4"
              >
                <X size={24} className="text-[#7F5539]" />
                </button>
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B08968]"></div>
                </div>
              }>
                <EntryForm 
                  onClose={() => setIsEntryModalOpen(false)} 
                  projectId={selectedProject?._id}
                  onSuccess={() => {
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
                  }}
                />
              </Suspense>
            </div>
          </div>
        )}

        {showNotification && (
          <Toast message={notificationMessage} type={notificationType} />
        )}
      </main>
    </div>
  );
};

// Create a prop types validator for each component if needed
// ProjectList.propTypes = {
//   projects: PropTypes.array.isRequired,
//   selectedProject: PropTypes.object,
//   onSelectProject: PropTypes.func.isRequired,
//   onDeleteProject: PropTypes.func.isRequired,
// };

// FinancialSummary.propTypes = {
//   summary: PropTypes.shape({
//     totalIncome: PropTypes.number,
//     totalExpenses: PropTypes.number,
//     netBalance: PropTypes.number,
//   }).isRequired,
// };

// Charts.propTypes = {
//   monthlyExpenses: PropTypes.array.isRequired,
//   incomeVsExpense: PropTypes.array.isRequired,
//   colorPalette: PropTypes.arrayOf(PropTypes.string).isRequired,
// };

// MobileHeader.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   setIsOpen: PropTypes.func.isRequired,
// };

// MobileMenu.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   setIsOpen: PropTypes.func.isRequired,
//   navigate: PropTypes.func.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// Toast.propTypes = {
//   message: PropTypes.string.isRequired,
//   type: PropTypes.oneOf(['success', 'error']).isRequired,
// };

export default React.memo(Dashboard);