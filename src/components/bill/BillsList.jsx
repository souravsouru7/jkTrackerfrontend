import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBills, generatePDF, duplicateBill } from '../../store/slice/interiorBillingSlice';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Plus, Edit, Copy } from 'lucide-react';
import Navbar from '../../pages/Navbar';
import Loader from '../Loader';

const BillsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, error, loadingStates } = useSelector((state) => state.interiorBilling);
  const { token } = useSelector((state) => state.auth);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchAllBills());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

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
      dispatch(fetchAllBills());
    } catch (error) {
      setPdfError(error.message || 'Failed to duplicate bill');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] pt-14 md:pt-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
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
              <div className="overflow-x-auto rounded-lg">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-[#B08968]/10">
                      <thead className="bg-[#B08968]/10">
                        <tr>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Bill Number</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Type</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Date</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Customer Name</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Grand Total</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#7F5539]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#B08968]/10 bg-white/50">
                        {bills.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                              No bills found
                            </td>
                          </tr>
                        ) : (
                          bills.map((bill) => (
                            <tr
                              key={bill._id}
                              className={`hover:bg-[#B08968]/5 transition-colors duration-300 ${
                                bill.billType === 'DUPLICATE' ? 'bg-[#7F5539]/5' : ''
                              }`}
                            >
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
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
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {bill.documentType}
                                {bill.originalBillId && (
                                  <span className="ml-2 text-xs text-[#7F5539]">
                                    (Copy of {bill.originalBillId.billNumber})
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">{new Date(bill.date).toLocaleDateString()}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">{bill.clientName}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">₹{bill.grandTotal ? bill.grandTotal.toFixed(2) : '0.00'}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <div className="flex flex-wrap gap-2 justify-start items-center">
                                  <button
                                    onClick={() => handleEditBill(bill._id)}
                                    className="p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10"
                                    title="Edit Bill"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPDF(bill._id)}
                                    disabled={loadingStates.generatePDF}
                                    className={`p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10 
                                      ${loadingStates.generatePDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Download PDF"
                                  >
                                    <FileText size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateBill(bill._id)}
                                    className="p-2 text-[#7F5539] hover:text-[#9C6644] transition-colors duration-300 rounded-full hover:bg-[#B08968]/10"
                                    title="Duplicate Bill"
                                  >
                                    <Copy size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .overflow-x-auto {
            margin: 0;
            width: 100%;
          }
          table {
            width: 100%;
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          td, th {
            min-width: 120px;
            padding: 0.75rem 0.5rem;
          }
          td:first-child, th:first-child {
            min-width: 150px;
          }
          td:last-child, th:last-child {
            min-width: 140px;
          }
          .action-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </>
  );
};

export default BillsList;
