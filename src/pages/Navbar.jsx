import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { LogOut, FileText, Calculator, PlusCircle, Menu, X, LayoutDashboard, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#8B5E34]/20 sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/jklogo.jpg" 
                alt="JK Interiors Logo" 
                className="h-10 w-auto object-contain"
              />
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
              <item.icon className={`h-6 w-6 ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className={`text-xs mt-1 ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </button>
          ))}
          <button
            onClick={() => handleNavigation('more')}
            className="flex flex-col items-center justify-center w-16 py-1"
          >
            <MoreHorizontal className={`h-6 w-6 ${showMobileMenu ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 ${showMobileMenu ? 'text-indigo-600' : 'text-gray-500'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile More Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 p-4 rounded-t-2xl shadow-lg"
          >
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;