import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const BreakdownModal = ({ isOpen, onClose, type, projects, year }) => {
    const isIncome = type === 'Income';
    const title = isIncome ? 'Income Breakdown' : 'Expense Breakdown';
    const accentColor = isIncome ? 'text-green-600' : 'text-[#7F5539]';
    const progressColor = isIncome ? 'bg-green-500' : 'bg-[#B08968]';
    const icon = isIncome ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-[#7F5539]" />;

    const filteredProjects = projects
        .map(p => ({
            name: p.projectName,
            amount: isIncome ? p.income : p.expenses
        }))
        .filter(p => p.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    const totalAmount = filteredProjects.reduce((sum, p) => sum + p.amount, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 md:bg-black/60 backdrop-blur-[2px] md:backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full md:w-[90%] md:max-w-lg bg-white rounded-t-[2.5rem] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 md:hidden shrink-0" />

                        {/* Header */}
                        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${isIncome ? 'bg-green-50' : 'bg-orange-50'}`}>
                                    {icon}
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-[#7F5539] tracking-tight">{title}</h2>
                                    <p className="text-sm font-medium text-gray-400">Total split for {year}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 max-h-[70vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {filteredProjects.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredProjects.map((project, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                            className="group p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-gray-100"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="font-bold text-[#7F5539] text-base md:text-lg">{project.name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black ${accentColor} text-lg`}>
                                                        ₹{project.amount.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        {((project.amount / totalAmount) * 100).toFixed(1)}% of total
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="relative h-2.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(project.amount / totalAmount) * 100}%` }}
                                                    transition={{ duration: 1.2, ease: "circOut", delay: 0.2 + (index * 0.1) }}
                                                    className={`absolute inset-y-0 left-0 rounded-full ${progressColor}`}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <TrendingDown size={40} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#7F5539] mb-1">No data available</h3>
                                    <p className="text-sm text-gray-400">There are no {type.toLowerCase()} records for the selected period.</p>
                                </div>
                            )}
                        </div>

                        {/* Total Footer */}
                        <div className="p-8 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100 shrink-0">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-bold text-gray-400">₹</span>
                                        <span className={`text-3xl md:text-4xl font-black ${accentColor} tracking-tighter`}>
                                            {totalAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-xs font-bold ${isIncome ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#7F5539]'}`}>
                                    {filteredProjects.length} Projects
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BreakdownModal;
