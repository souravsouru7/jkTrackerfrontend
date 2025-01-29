import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';
import { Receipt } from 'lucide-react';

const API_URL = config.API_URL;

const PaymentBill = () => {
    const [amountReceived, setAmountReceived] = useState('');
    const [notes, setNotes] = useState('');
    const selectedProject = useSelector(state => state.projects.selectedProject);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/api/payment-bills/generate`, {
                projectId: selectedProject._id,
                amountReceived: parseFloat(amountReceived),
                notes
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setSuccess('Payment bill generated successfully!');
            setAmountReceived('');
            setNotes('');

            // Download PDF
            const pdfResponse = await axios.get(`${API_URL}/api/payment-bills/${response.data._id}/pdf`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payment_receipt_${response.data.billNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating payment bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5EBE0]/30">
            <Navbar />
            
            {/* Main Content - Adjusted padding for mobile */}
            <div className="pt-14 md:pt-0 pb-20 md:pb-0"> {/* Added top padding for mobile logo and bottom padding for mobile nav */}
                {/* Page Header */}
                <div className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-3">
                            <Receipt size={24} className="text-[#7F5539]" />
                            <h1 className="text-2xl font-bold text-[#7F5539]">Payment Bill Generator</h1>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Generate payment bills and receipts for your projects</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {!selectedProject ? (
                        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Project Selected</h2>
                            <p className="text-gray-500 mb-4">Please select a project from the dashboard to generate a payment bill</p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.location.href = '/dashboard'}
                                className="bg-[#7F5539] text-white px-6 py-2 rounded-md hover:bg-[#7F5539]/90"
                            >
                                Go to Dashboard
                            </motion.button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-[#7F5539] mb-4">Project Information</h2>
                                <div className="bg-[#DEB887]/10 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Project Name</p>
                                            <p className="text-lg font-medium text-gray-700">{selectedProject.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Project Budget</p>
                                            <p className="text-lg font-medium text-gray-700">₹{selectedProject.budget.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount Received
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            value={amountReceived}
                                            onChange={(e) => setAmountReceived(e.target.value)}
                                            className="pl-8 shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md py-2 focus:ring-[#7F5539] focus:border-[#7F5539]"
                                            required
                                            min="1"
                                            max={selectedProject.budget}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="3"
                                        className="shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-[#7F5539] focus:border-[#7F5539]"
                                        placeholder="Add any additional notes or payment details..."
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                        <p className="text-sm text-green-600">{success}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7F5539] hover:bg-[#7F5539]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7F5539] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating Bill...
                                        </span>
                                    ) : 'Generate Payment Bill'}
                                </motion.button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentBill;
