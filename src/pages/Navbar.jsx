import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { LogOut, FileText, Calculator, PlusCircle, LayoutDashboard, MoreHorizontal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JKLogo from '../components/common/JKLogo';
import SharedExpenseModal from '../components/SharedExpenseModal';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isSharedExpenseModalOpen, setIsSharedExpenseModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const createDropdownRef = useRef(null);
  const modalRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))._id;
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name: projectName,
          description,
          budget: Number(budget),
          userId
        })
      });

      if (response.ok) {
        setShowCreateProjectModal(false);
        setProjectName('');
        setDescription('');
        setBudget('');
        // Optionally refresh the page or update projects list
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Failed to create project:', error);
        throw new Error(error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) {
        setShowCreateDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateProjectModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Entries", icon: FileText, path: "/entries" },
    { name: "Create Bill", icon: PlusCircle, path: "/create-bill" },
    { name: "Balance Sheet", icon: Calculator, path: "/balance-sheet" }
  ];

  const mobileNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Entries", icon: FileText, path: "/entries" },
    { name: "Create", icon: PlusCircle, path: "create" },
    { name: "Balance Sheet", icon: Calculator, path: "/balance-sheet" }
  ];

  const handleNavigation = (path, documentType) => {
    if (path === 'create') {
      setShowCreateDropdown(!showCreateDropdown);
    } else if (path === 'more') {
      setShowMobileMenu(!showMobileMenu);
    } else {
      if (path === '/create-bill' && documentType) {
        navigate(path, { state: { documentType } });
      } else {
        navigate(path);
      }
      setIsOpen(false);
      setShowMobileMenu(false);
      setShowCreateDropdown(false);
    }
  };

  return (
    <>
      {/* Mobile Top Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-[#8B5E34]/20">
        <div className="flex justify-center items-center h-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-3"
          >
            <JKLogo size="90" className="md:hidden mt-1" />
          </motion.div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-[#8B5E34]/20 sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <motion.div
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <JKLogo size="90" />
              </motion.div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-[#8B5E34] text-white'
                        : 'text-[#8B5E34] hover:bg-[#8B5E34]/10'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-between items-center px-4 py-2">
          {mobileNavItems.map((item, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center justify-center w-16 py-1"
              >
                <item.icon className={`h-6 w-6 ${
                  (location.pathname === item.path || (item.path === 'create' && showCreateDropdown)) 
                  ? 'text-[#8B5E34]' : 'text-gray-500'
                }`} />
                <span className={`text-xs mt-1 ${
                  (location.pathname === item.path || (item.path === 'create' && showCreateDropdown))
                  ? 'text-[#8B5E34]' : 'text-gray-500'
                }`}>
                  {item.name}
                </span>
              </button>
              
              {/* Create Dropdown */}
              {item.path === 'create' && showCreateDropdown && (
                <div 
                  ref={createDropdownRef}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg border border-[#B08968]/20 py-2"
                >
                  <button
                    onClick={() => handleNavigation('/create-bill', 'Invoice')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#F5EBE0] flex items-center gap-2 ${
                      location.pathname === '/create-bill' && location.state?.documentType === 'Invoice'
                        ? 'text-[#8B5E34] bg-[#F5EBE0]'
                        : 'text-[#7F5539]'
                    }`}
                  >
                    <FileText size={16} />
                    Create Invoice
                  </button>
                  <button
                    onClick={() => handleNavigation('/create-bill', 'Estimate')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#F5EBE0] flex items-center gap-2 ${
                      location.pathname === '/create-bill' && location.state?.documentType === 'Estimate'
                        ? 'text-[#8B5E34] bg-[#F5EBE0]'
                        : 'text-[#7F5539]'
                    }`}
                  >
                    <FileText size={16} />
                    Create Estimate
                  </button>
                  <button
                    onClick={() => handleNavigation('/create-bill', 'Quotation')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#F5EBE0] flex items-center gap-2 ${
                      location.pathname === '/create-bill' && location.state?.documentType === 'Quotation'
                        ? 'text-[#8B5E34] bg-[#F5EBE0]'
                        : 'text-[#7F5539]'
                    }`}
                  >
                    <FileText size={16} />
                    Create Quotation
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex flex-col items-center justify-center w-16 py-1"
            >
              <MoreHorizontal className={`h-6 w-6 ${showDropdown ? 'text-[#8B5E34]' : 'text-gray-500'}`} />
              <span className={`text-xs mt-1 ${showDropdown ? 'text-[#8B5E34]' : 'text-gray-500'}`}>
                More
              </span>
            </button>

            {/* More Dropdown */}
            {showDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-[#B08968]/20 py-2">
                <button
                  onClick={() => {
                    setShowCreateProjectModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F5EBE0] flex items-center gap-2 text-[#7F5539]"
                >
                  <Plus size={16} />
                  Create Project
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <h2 className="text-xl font-semibold text-[#7F5539] mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#7F5539]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#7F5539]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#7F5539]"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateProjectModal(false)}
                    className="flex-1 py-2 border border-[#7F5539] text-[#7F5539] rounded hover:bg-[#7F5539]/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#7F5539] text-white rounded hover:bg-[#7F5539]/90"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add SharedExpenseModal component */}
      <SharedExpenseModal
        isOpen={isSharedExpenseModalOpen}
        onClose={() => setIsSharedExpenseModalOpen(false)}
        userId={JSON.parse(localStorage.getItem('user'))?._id}
      />
    </>
  );
};

export default Navbar;