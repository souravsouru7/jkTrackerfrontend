import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBills, generatePDF, duplicateBill } from '../../store/slice/interiorBillingSlice';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Plus, Edit, Copy } from 'lucide-react';
import Navbar from '../../pages/Navbar';
import Loader from '../Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const BillsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, error, loadingStates } = useSelector((state) => state.interiorBilling);
  const { token } = useSelector((state) => state.auth);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    // Only fetch bills if we have a token
    if (token) {
      dispatch(fetchAllBills());
    }
  }, [dispatch, token]);

  // Redirect to login if no token is present
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Add intersection observer for table rows
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleViewBill = (id) => {
    navigate(`/bills/${id}`);
  };

  const handleEditBill = (id) => {
    navigate(`/edit-bill/${id}`);
  };

  const handleDownloadPDF = async (id) => {
    try {
      await dispatch(generatePDF(id)).unwrap();
    } catch (error) {
      setPdfError(error.message || 'Failed to generate PDF');
    }
  };

  const handleDuplicateBill = async (id) => {
    try {
      await dispatch(duplicateBill(id)).unwrap();
      // Optionally refresh the bills list
      dispatch(fetchAllBills());
    } catch (error) {
      setPdfError(error.message || 'Failed to duplicate bill');
    }
  };

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] pt-14 md:pt-6"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-4 sm:p-6"
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            {pdfError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {pdfError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
              <h1 className="text-2xl font-bold text-[#7F5539]">Interior Bills</h1>
              <button
                onClick={() => navigate('/create-bill')}
                className="w-full sm:w-auto bg-[#7F5539] text-white px-4 py-2 rounded-lg hover:bg-[#9C6644] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Create New Bill
              </button>
            </div>
            
            {loadingStates.fetchBills ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[800px] p-3 sm:p-0">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-[#B08968]/10">
                        <th className="px-4 py-2 text-left text-[#7F5539]">Bill Number</th>
                        <th className="px-4 py-2 text-left text-[#7F5539]">Type</th>
                        <th className="px-4 py-2 text-left text-[#7F5539]">Date</th>
                        <th className="px-4 py-2 text-left text-[#7F5539]">Customer Name</th>
                        <th className="px-4 py-2 text-left text-[#7F5539]">Grand Total</th>
                        <th className="px-4 py-2 text-left text-[#7F5539]">Actions</th>
                      </tr>
                    </thead>
                    <tbody ref={ref}>
                      {bills.length === 0 ? (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <td colSpan={6} className="px-4 py-2 text-center">
                            No bills found
                          </td>
                        </motion.tr>
                      ) : (
                        bills.map((bill, index) => (
                          <motion.tr
                            key={bill._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`border-b border-[#B08968]/10 hover:bg-[#B08968]/5 transition-colors duration-300 ${
                              bill.billType === 'DUPLICATE' ? 'bg-[#7F5539]/5' : ''
                            }`}
                          >
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                {bill.billNumber}
                                {bill.billType === 'DUPLICATE' ? (
                                  <span className="px-2 py-1 text-xs bg-[#7F5539] text-white rounded-full">
                                    COPY
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                                    ORIGINAL
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {bill.documentType}
                              {bill.originalBillId && (
                                <span className="ml-2 text-xs text-[#7F5539]">
                                  (Copy of {bill.originalBillId.billNumber})
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">{new Date(bill.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{bill.clientName}</td>
                            <td className="px-4 py-2">₹{bill.grandTotal ? bill.grandTotal.toFixed(2) : '0.00'}</td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-2 justify-start items-center">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditBill(bill._id)}
                                  className="p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10"
                                  title="Edit Bill"
                                >
                                  <Edit size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDownloadPDF(bill._id)}
                                  disabled={loadingStates.generatePDF}
                                  className={`p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10 
                                    ${loadingStates.generatePDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Download PDF"
                                >
                                  <FileText size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDuplicateBill(bill._id)}
                                  className="p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10"
                                  title="Duplicate Bill"
                                >
                                  <Copy size={18} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <style jsx>{`
        @media (max-width: 640px) {
          .table-container {
            margin: 0 -1rem;
          }
          
          td, th {
            white-space: nowrap;
          }
          
          .action-buttons {
            display: flex;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default BillsList;
