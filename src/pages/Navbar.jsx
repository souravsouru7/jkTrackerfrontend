import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { LogOut, FileText, Calculator, PlusCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: "Entries", icon: FileText, path: "/entries" },
    { name: "Balance Sheet", icon: Calculator, path: "/balance-sheet" },
    { name: "Create Bill", icon: PlusCircle, path: "/create-bill" },
    { name: "Dashboard", icon: PlusCircle, path: "/dashboard" }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#B08968]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className="flex items-center px-4 py-2 rounded-md text-[#9C6644] hover:bg-[#B08968]/10"
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-md text-white bg-[#B08968] hover:bg-[#9C6644]"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#7F5539] p-2"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 bg-white/90 backdrop-blur-md z-30 border-b border-[#B08968]/20"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center w-full px-4 py-3 text-[#9C6644] hover:bg-[#B08968]/10 rounded-md"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-white bg-[#B08968] hover:bg-[#9C6644] rounded-md"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;