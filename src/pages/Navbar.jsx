import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { LogOut, FileText, Calculator, PlusCircle, Menu, X, LayoutDashboard, MoreHorizontal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JKLogo from '../components/common/JKLogo';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Entries", icon: FileText, path: "/entries" },
    { name: "Balance Sheet", icon: Calculator, path: "/balance-sheet" },
    { name: "Create Bill", icon: PlusCircle, path: "/create-bill" }
  ];

  const mobileNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Entries", icon: FileText, path: "/entries" },
    { name: "Balance Sheet", icon: Calculator, path: "/balance-sheet" },
    { name: "Create Bill", icon: PlusCircle, path: "/create-bill" }
  ];

  const handleNavigation = (path) => {
    if (path === 'more') {
      setShowMobileMenu(!showMobileMenu);
    } else {
      navigate(path);
      setIsOpen(false);
      setShowMobileMenu(false);
    }
  };

  return (
    <>
      {/* Mobile Top Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex justify-center items-center h-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-2"
          >
            <JKLogo size="90" />
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
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="flex flex-col items-center justify-center w-16 py-1"
            >
              <item.icon className={`h-6 w-6 ${
                location.pathname === item.path ? 'text-[#8B5E34]' : 'text-gray-500'
              }`} />
              <span className={`text-xs mt-1 ${
                location.pathname === item.path ? 'text-[#8B5E34]' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
            </button>
          ))}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex flex-col items-center justify-center w-16 py-1"
            >
              <MoreHorizontal className={`h-6 w-6 ${
                showDropdown ? 'text-[#8B5E34]' : 'text-gray-500'
              }`} />
              <span className={`text-xs mt-1 ${
                showDropdown ? 'text-[#8B5E34]' : 'text-gray-500'
              }`}>
                More
              </span>
            </button>
            
            {showDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-[#B08968]/20 py-2">
                <button
                  onClick={() => {
                    setShowCreateProjectModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#7F5539] hover:bg-[#F5EBE0] flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Project
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-[#7F5539] hover:bg-[#F5EBE0] flex items-center gap-2"
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
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#7F5539] mb-4">Create New Project</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Add your project creation logic here
              setShowCreateProjectModal(false);
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full px-4 py-2 rounded-lg border border-[#B08968]/20"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full px-4 py-2 rounded-lg border border-[#B08968]/20"
                />
                <input
                  type="number"
                  placeholder="Budget"
                  className="w-full px-4 py-2 rounded-lg border border-[#B08968]/20"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#7F5539] text-white rounded-lg hover:bg-[#9C6644] transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateProjectModal(false)}
                    className="flex-1 py-2 border border-[#7F5539] text-[#7F5539] rounded-lg hover:bg-[#F5EBE0] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;