import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBills, generatePDF } from '../../store/slice/interiorBillingSlice';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Plus, Edit } from 'lucide-react';
import Navbar from '../../pages/Navbar';

const BillsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills, error, loadingStates } = useSelector((state) => state.interiorBilling);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBills());
  }, [dispatch]);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-6">
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#7F5539]">Interior Bills</h1>
              <button
                onClick={() => navigate('/create-bill')}
                className="bg-[#7F5539] text-white px-4 py-2 rounded-lg hover:bg-[#9C6644] transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Create New Bill
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-[#B08968]/10">
                    <th className="px-4 py-2 text-left text-[#7F5539]">Bill Number</th>
                    <th className="px-4 py-2 text-left text-[#7F5539]">Date</th>
                    <th className="px-4 py-2 text-left text-[#7F5539]">Customer Name</th>
                    <th className="px-4 py-2 text-left text-[#7F5539]">Grand Total</th>
                    <th className="px-4 py-2 text-left text-[#7F5539]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-center">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill._id} className="border-b border-[#B08968]/10 hover:bg-[#B08968]/5">
                        <td className="px-4 py-2">{bill.billNumber}</td>
                        <td className="px-4 py-2">{new Date(bill.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{bill.customerName}</td>
                        <td className="px-4 py-2">₹{bill.grandTotal ? bill.grandTotal.toFixed(2) : '0.00'}</td>
                        <td className="px-4 py-2 space-x-2">
                         
                          <button
                            onClick={() => handleEditBill(bill._id)}
                            className="text-[#7F5539] hover:text-[#9C6644]"
                            title="Edit Bill"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(bill._id)}
                            disabled={loadingStates.generatePDF}
                            className={`text-[#7F5539] hover:text-[#9C6644] ${loadingStates.generatePDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Download PDF"
                          >
                            <FileText size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillsList;