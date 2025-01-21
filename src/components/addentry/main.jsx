import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEntry, updateEntry, fetchEntries, deleteEntry } from '../../store/slice/entrySlice';
import { Plus, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';
import EntryForm from './EntryForm';
import Navbar from '../../pages/Navbar';
import ExportButton from './ExportButton';

const ExpenseTracker = () => {
  const dispatch = useDispatch();
  const { entries, status, error } = useSelector((state) => state.entries);
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: 'All',
    category: 'All',
    dateRange: 'All',
    sortBy: 'date'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    dispatch(fetchEntries());
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchEntries());
    }
  }, [dispatch, selectedProject?._id]);

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center p-8 bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-[#7F5539] mb-4">Select a Project</h2>
            <p className="text-[#9C6644]">Please select a project from the dashboard to view its entries.</p>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredEntries = () => {
    let filteredEntries = entries.filter(entry => {
      const matchesSearch = 
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.amount.toString().includes(searchTerm);
      
      const matchesType = activeFilters.type === 'All' || entry.type === activeFilters.type;
      const matchesCategory = activeFilters.category === 'All' || entry.category === activeFilters.category;
      
      let matchesDate = true;
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      switch (activeFilters.dateRange) {
        case 'Today':
          matchesDate = entryDate.toDateString() === today.toDateString();
          break;
        case 'This Week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          matchesDate = entryDate >= weekAgo;
          break;
        case 'This Month':
          matchesDate = 
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getFullYear() === today.getFullYear();
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });

    switch (activeFilters.sortBy) {
      case 'date':
        filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'amount':
        filteredEntries.sort((a, b) => b.amount - a.amount);
        break;
      case 'category':
        filteredEntries.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    return filteredEntries;
  };

  const categories = ['All', ...new Set(entries.map(entry => entry.category))];

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      dispatch(deleteEntry(id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
      <Navbar />
      {/* Main content with proper spacing from navbar */}
      <div className="pt-16"> {/* Add padding-top to account for navbar height */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header Section */}
          <div className={`sticky ${isScrolled ? 'top-16' : 'top-20'} z-10 bg-white/80 backdrop-blur-md border-b border-[#B08968]/20 p-4 transition-all duration-300`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setSelectedEntry(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#7F5539] rounded-md hover:bg-[#9C6644] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7F5539]"
                >
                  <Plus size={16} />
                  Add Entry
                </button>
                <ExportButton />
              </div>
              <h1 className="text-3xl font-bold text-[#7F5539]">
                Expense Tracker
                <span className="block text-sm font-normal text-[#9C6644] mt-1">
                  Track your expenses and income efficiently
                </span>
              </h1>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C6644]" size={20} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#B08968] focus:ring-2 focus:ring-[#B08968] focus:border-[#B08968] transition-all duration-200"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg hover:bg-white/70 transition-colors duration-200 text-[#7F5539]"
              >
                <Filter size={20} className="text-[#9C6644]" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Type', 'Category', 'Date Range', 'Sort By'].map((filterType) => (
                  <div key={filterType}>
                    <label className="block text-sm font-medium text-[#7F5539] mb-2">{filterType}</label>
                    <select
                      value={activeFilters[filterType.toLowerCase().replace(' ', '')]}
                      onChange={(e) => setActiveFilters(prev => ({
                        ...prev,
                        [filterType.toLowerCase().replace(' ', '')]: e.target.value
                      }))}
                      className="w-full p-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:ring-2 focus:ring-[#B08968] transition-all duration-200"
                    >
                      {filterType === 'Type' ? (
                        <>
                          <option value="All">All</option>
                          <option value="Income">Income</option>
                          <option value="Expense">Expense</option>
                        </>
                      ) : filterType === 'Category' ? (
                        categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))
                      ) : filterType === 'Date Range' ? (
                        <>
                          <option value="All">All Time</option>
                          <option value="Today">Today</option>
                          <option value="This Week">This Week</option>
                          <option value="This Month">This Month</option>
                        </>
                      ) : (
                        <>
                          <option value="date">Date</option>
                          <option value="amount">Amount</option>
                          <option value="category">Category</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entries List */}
          <div className="bg-white/30 backdrop-blur-md border border-[#B08968]/20 rounded-2xl shadow-xl p-6">
            {status === 'loading' && (
              <div className="text-center py-4 text-[#9C6644]">Loading entries...</div>
            )}
            {status === 'failed' && (
              <div className="text-center py-4 text-red-500">{error}</div>
            )}
            {status === 'succeeded' && (
              <div className="space-y-4">
                {getFilteredEntries().map((entry) => (
                  <div key={entry._id} 
                    className="bg-white/50 p-6 rounded-xl border border-[#B08968]/20 transition-all duration-200 hover:bg-white/70">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-[#7F5539]">{entry.category}</h3>
                        <p className="text-[#9C6644]">{entry.description}</p>
                        <p className="text-sm text-[#B08968]">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${entry.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                          {entry.type === 'Income' ? '+' : '-'}Rs{entry.amount.toFixed(2)}
                        </p>
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowForm(true);
                            }}
                            className="flex items-center space-x-1 text-[#9C6644] hover:text-[#7F5539] transition-colors duration-200"
                          >
                            <Edit2 size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md m-4">
            <div className="relative bg-white/95 rounded-2xl shadow-xl p-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedEntry(null);
                }}
                className="absolute top-4 right-4 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-200"
              >
                <X size={24} />
              </button>
              <EntryForm 
                entry={selectedEntry}
                onClose={() => {
                  setShowForm(false);
                  setSelectedEntry(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;