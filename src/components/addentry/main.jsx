import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEntry, updateEntry, fetchEntries, deleteEntry, downloadEntryAsBill } from '../../store/slice/entrySlice';
import { Plus, Search, Filter, X, Edit2, Trash2, Download, ChevronDown, ArrowRight } from 'lucide-react';
import EntryForm from './EntryForm';
import Navbar from '../../pages/Navbar';
import BillExportButton from './BillExportButton';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryLoading, setIsEntryLoading] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const loadEntries = async () => {
      setIsLoading(true);
      await dispatch(fetchEntries());
      setIsLoading(false);
    };
    
    loadEntries();
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchEntries());
    }
  }, [dispatch, selectedProject]);


  const { regularEntries, incomeFromOtherProjects } = useMemo(() => {
    const regular = entries.filter(entry => !entry.isIncomeFromOtherProject);
    const fromOtherProjects = entries.filter(entry => entry.isIncomeFromOtherProject);
    return { regularEntries: regular, incomeFromOtherProjects: fromOtherProjects };
  }, [entries]);

  // Calculate totals for regular entries only
  const allTotals = useMemo(() => {
    return regularEntries.reduce((acc, entry) => {
      if (entry.type === 'Income') {
        acc.income += entry.amount;
      } else {
        acc.expense += entry.amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [regularEntries]);

  // Calculate total income from other projects
  const totalIncomeFromOtherProjects = useMemo(() => {
    return incomeFromOtherProjects.reduce((total, entry) => total + entry.amount, 0);
  }, [incomeFromOtherProjects]);

  const filterEntry = (entry) => {
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
  };

  const filterIncomeFromOtherProjects = (entry) => {
    const matchesSearch = 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.amount.toString().includes(searchTerm);
    
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

    return matchesSearch && matchesDate;
  };

  const sortEntries = (entries) => {
    switch (activeFilters.sortBy) {
      case 'date':
        return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'amount':
        return [...entries].sort((a, b) => b.amount - a.amount);
      case 'category':
        return [...entries].sort((a, b) => a.category.localeCompare(b.category));
      default:
        return entries;
    }
  };

  // Get filtered and sorted entries
  const filteredEntries = useMemo(() => {
    const filtered = regularEntries.filter(filterEntry);
    return sortEntries(filtered);
  }, [regularEntries, filterEntry, sortEntries]);

  const filteredIncomeFromOtherProjects = useMemo(() => {
    const filtered = incomeFromOtherProjects.filter(filterIncomeFromOtherProjects);
    return sortEntries(filtered);
  }, [incomeFromOtherProjects, filterIncomeFromOtherProjects, sortEntries]);

  // Calculate totals for filtered entries
  const filteredTotals = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      const amount = entry.amount || 0;
      if (entry.type === 'Income') {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredEntries]);

  // Calculate totals for filtered income from other projects
  const filteredIncomeFromOtherProjectsTotal = useMemo(() => {
    return filteredIncomeFromOtherProjects.reduce((total, entry) => total + (entry.amount || 0), 0);
  }, [filteredIncomeFromOtherProjects]);

  // Get the total label based on filters
  const getTotalLabel = () => {
    if (activeFilters.type !== 'All') {
      return `Total ${activeFilters.type}`;
    }
    if (activeFilters.category !== 'All') {
      return `Total for ${activeFilters.category}`;
    }
    return 'Total Amount';
  };

  const categories = ['All', ...new Set(regularEntries.map(entry => entry.category))];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setIsEntryLoading(true);
      await dispatch(deleteEntry(id));
      setIsEntryLoading(false);
    }
  };

  const handleDownloadBill = async (entry) => {
    if (entry.type !== 'Income') {
      alert('Only income entries can be downloaded as bills');
      return;
    }
    
    try {
      setIsEntryLoading(true);
      await dispatch(downloadEntryAsBill(entry._id)).unwrap();
    } catch (error) {
      console.error('Failed to download bill:', error);
      alert('Failed to download bill: ' + error.message);
    } finally {
      setIsEntryLoading(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-[#FDF8F3]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg mx-4">
            <h2 className="text-2xl font-bold text-[#7F5539] mb-4">Select a Project</h2>
            <p className="text-[#9C6644]">Please select a project from the dashboard to view its entries.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <Navbar />
      <div className="pt-14 md:pt-16 pb-24"> {/* Adjusted padding for mobile */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4 md:space-y-6">
          {/* Header Section - Mobile Optimized */}
          <div className="sticky top-14 md:top-16 z-30 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#7F5539]">
                    Expense Tracker
                  </h1>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowForm(true);
                        setSelectedEntry(null);
                      }}
                      className="p-2 md:px-4 md:py-2 bg-[#7F5539] text-white rounded-full md:rounded-lg shadow-md hover:bg-[#9C6644] transition-colors"
                    >
                      <Plus size={20} className="md:hidden" />
                      <span className="hidden md:inline-flex items-center gap-2">
                        <Plus size={16} /> Add Entry
                      </span>
                    </motion.button>
                    <BillExportButton />
                  </div>
                </div>

                {/* Totals Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  {activeFilters.type === 'All' ? (
                    // Show both income and expense when no type filter
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-[#9C6644] mb-1">Total Income</p>
                          <p className="text-sm md:text-base font-semibold text-green-600">
                            ₹{filteredTotals.income.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="text-center border-l border-[#B08968]/10">
                          <p className="text-xs text-[#9C6644] mb-1">Total Expense</p>
                          <p className="text-sm md:text-base font-semibold text-red-600">
                            ₹{filteredTotals.expense.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="text-center border-l border-[#B08968]/10">
                          <p className="text-xs text-[#9C6644] mb-1">Cash in Hand</p>
                          <p className={`text-sm md:text-base font-semibold ${
                            (filteredTotals.income - filteredTotals.expense) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ₹{(filteredTotals.income - filteredTotals.expense).toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })}
                          </p>
                        </div>
                      </div>
                      {filteredIncomeFromOtherProjectsTotal > 0 && (
                        <div className="border-t border-[#B08968]/10 pt-3">
                          <div className="text-center">
                            <p className="text-xs text-[#9C6644] mb-1">Income from Other Projects</p>
                            <p className="text-sm md:text-base font-semibold text-blue-600">
                              ₹{filteredIncomeFromOtherProjectsTotal.toLocaleString('en-IN', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show single total when type filter is applied
                    <div className="text-center">
                      <p className="text-xs text-[#9C6644] mb-1">{getTotalLabel()}</p>
                      <p className={`text-lg font-semibold ${
                        activeFilters.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{(activeFilters.type === 'Income' ? filteredTotals.income : filteredTotals.expense)
                          .toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2
                          })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Search Bar - Mobile Optimized */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9C6644]" size={20} />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#B08968]/20 rounded-full text-[#7F5539] placeholder-[#B08968] focus:ring-2 focus:ring-[#B08968] focus:border-transparent shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Filter Button - Mobile Optimized */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full px-4 py-2 border-t border-[#B08968]/10 text-[#7F5539]"
            >
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <ChevronDown
                size={18}
                className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </div>

          {/* Filter Options - Mobile Optimized */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white rounded-lg shadow-md"
              >
                <div className="p-4 space-y-4">
                  {['Type', 'Category', 'Date Range', 'Sort By'].map((filterType) => (
                    <div key={filterType} className="space-y-2">
                      <label className="text-sm font-medium text-[#7F5539]">{filterType}</label>
                      <select
                        value={activeFilters[filterType.toLowerCase().replace(' ', '')]}
                        onChange={(e) => setActiveFilters(prev => ({
                          ...prev,
                          [filterType.toLowerCase().replace(' ', '')]: e.target.value
                        }))}
                        className="w-full p-2.5 bg-white border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:ring-2 focus:ring-[#B08968] shadow-sm"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries List - Enhanced Loading States */}
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              <>
                {/* Regular Entries */}
                {filteredEntries.length > 0 && (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        layout
                        transition={{ 
                          duration: 0.2,
                          layout: { duration: 0.2 }
                        }}
                        className={`bg-white rounded-lg shadow-md overflow-hidden ${
                          isEntryLoading ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-[#7F5539] line-clamp-1">{entry.description}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-[#9C6644]">{entry.category}</span>
                                <span className="text-xs text-[#B08968]">
                                  {new Date(entry.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`font-semibold ${
                                entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entry.type === 'Income' ? '+' : '-'}₹{entry.amount}
                              </span>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setSelectedEntry(entry);
                                    setShowForm(true);
                                  }}
                                  className="p-1.5 text-[#7F5539] hover:bg-[#7F5539]/10 rounded-full transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {entry.type === 'Income' && (
                                  <button
                                    onClick={() => handleDownloadBill(entry)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Download as Bill"
                                  >
                                    <Download size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(entry._id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Income from Other Projects Section */}
                {filteredIncomeFromOtherProjects.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Income from Other Projects</h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        These are payments received from other projects and are not included in the main income calculations.
                      </p>
                      <div className="space-y-2">
                        {filteredIncomeFromOtherProjects.map((entry) => (
                          <motion.div
                            key={entry._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            layout
                            transition={{ 
                              duration: 0.2,
                              layout: { duration: 0.2 }
                            }}
                            className={`bg-white rounded-lg shadow-sm overflow-hidden border border-blue-100 ${
                              isEntryLoading ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-blue-800 line-clamp-1">{entry.description}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-blue-600">From: {entry.category}</span>
                                    <span className="text-xs text-blue-500">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold text-blue-600">
                                    +₹{entry.amount}
                                  </span>
                                  <div className="flex items-center gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setSelectedEntry(entry);
                                        setShowForm(true);
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    {entry.type === 'Income' && (
                                      <button
                                        onClick={() => handleDownloadBill(entry)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Download as Bill"
                                      >
                                        <Download size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(entry._id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* No entries message */}
                {filteredEntries.length === 0 && filteredIncomeFromOtherProjects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#9C6644]">No entries found matching your filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Entry Form Modal - Enhanced Transitions */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              className="w-full md:w-auto md:min-w-[500px] bg-white rounded-t-2xl md:rounded-2xl shadow-xl"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#7F5539]">
                    {selectedEntry ? 'Edit Entry' : 'Add Entry'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedEntry(null);
                    }}
                    className="p-2 hover:bg-[#7F5539]/10 rounded-full transition-colors"
                  >
                    <X size={20} className="text-[#7F5539]" />
                  </button>
                </div>
                <EntryForm
                  entry={selectedEntry}
                  onClose={() => {
                    setShowForm(false);
                    setSelectedEntry(null);
                  }}
                  projectId={selectedProject?._id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseTracker;