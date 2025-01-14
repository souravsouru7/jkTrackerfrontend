import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createBill, generatePDF } from '../../store/slice/interiorBillingSlice';
import { Plus, Trash2, FileText } from 'lucide-react';
import Navbar from '../../pages/Navbar';
const CreateBill = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    customerName: '',
    items: [{
      particular: '',
      description: 'Providing and fixing of Table with 12mm plywood with necessary laminate and hardware',
      unit: 'Sft',
      width: 0,
      height: 0,
      sft: 0,
      pricePerUnit: 1250,
      total: 0
    }],
    companyDetails: {
      name: 'JK INTERIOR\'S',
      address: '502, Spellbound towers,Sainikpuri,Secunderabad,Telangana 501301',
      phones: ['9063096060', '8099961514']
    },
    paymentTerms: [
      { stage: 'Confirmation advance with work order', percentage: 0, amount: 50000, note: 'Token' }
    ],
    termsAndConditions: [
      'It will take 2 days to start the work in site after getting the basic advance, because we need to finalise the concept and drawings as per the concept selected'
    ]
  });

  // Existing calculation functions
  const calculateItemTotal = useCallback((item) => {
    if (item.unit === 'Sft') {
      const sft = item.width * item.height;
      return sft * item.pricePerUnit;
    }
    return item.pricePerUnit;
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prevData => {
      const newItems = [...prevData.items];
      const updatedItem = { ...newItems[index], [field]: value };
      
      if (field === 'width' || field === 'height' || field === 'pricePerUnit') {
        updatedItem.sft = updatedItem.width * updatedItem.height;
        updatedItem.total = calculateItemTotal(updatedItem);
      }
      
      newItems[index] = updatedItem;
      return { ...prevData, items: newItems };
    });
  }, [calculateItemTotal]);

  const grandTotal = formData.items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedPaymentTerms = formData.paymentTerms.map(term => ({
      ...term,
      amount: term.note === 'Token' ? term.amount : (grandTotal * term.percentage) / 100
    }));

    const billData = {
      ...formData,
      paymentTerms: updatedPaymentTerms,
      grandTotal
    };

    try {
      const result = await dispatch(createBill(billData)).unwrap();
      const pdfBlob = await dispatch(generatePDF(result._id)).unwrap();
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interior-bill-${result.billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-6 md:p-8">
          {/* Company Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#7F5539] mb-2">{formData.companyDetails.name}</h1>
            <p className="text-[#9C6644]">{formData.companyDetails.address}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-[#7F5539]">{phone}</p>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer and Bill Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-[#7F5539] mb-3">Customer Details</h2>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#7F5539] mb-3">Bill Details</h2>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.billDate}
                  onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#7F5539]">Items</h2>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...formData.items, {
                      particular: '',
                      description: 'Providing and fixing of Table with 12mm plywood with necessary laminate and hardware',
                      unit: 'Sft',
                      width: 0,
                      height: 0,
                      sft: 0,
                      pricePerUnit: 1250,
                      total: 0
                    }]
                  })}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B08968] text-white rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#B08968]/10">
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Particular</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Description</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Unit</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Width</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Height</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Sft</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Price</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Total</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-[#B08968]/5">
                        <td className="border border-[#B08968]/20 p-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                            value={item.particular}
                            onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
                            required
                          />
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          <textarea
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300 min-h-[60px]"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          <select
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          >
                            <option value="Sft">Sft</option>
                            <option value="Lump">Lump</option>
                          </select>
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          {item.unit === 'Sft' ? (
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={item.width || ''}
                              onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value))}
                              required
                            />
                          ) : '-'}
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          {item.unit === 'Sft' ? (
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={item.height || ''}
                              onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value))}
                              required
                            />
                          ) : '-'}
                        </td>
                        <td className="border border-[#B08968]/20 p-2 text-center text-[#7F5539]">
                          {item.unit === 'Sft' ? (item.width * item.height).toFixed(2) : '-'}
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                            value={item.pricePerUnit || ''}
                            onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value))}
                            required
                          />
                        </td>
                        <td className="border border-[#B08968]/20 p-2 text-right text-[#7F5539] font-medium">
                          ₹ {item.total.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = formData.items.filter((_, i) => i !== index);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right">
                <div className="inline-block bg-[#B08968]/10 p-4 rounded-lg">
                  <span className="text-xl font-semibold text-[#7F5539]">
                    GRAND TOTAL: ₹ {grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#7F5539]">Terms of Payment</h2>
              <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#B08968]/10">
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Stage</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">% of Amount</th>
                      <th className="border border-[#B08968]/20 p-3 text-[#7F5539] font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paymentTerms.map((term, index) => (
                      <tr key={index} className="hover:bg-[#B08968]/5">
                        <td className="border border-[#B08968]/20 p-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                            value={term.stage}
                            onChange={(e) => {
                              const newTerms = [...formData.paymentTerms];
                              newTerms[index] = { ...term, stage: e.target.value };
                              setFormData({ ...formData, paymentTerms: newTerms });
                            }}
                          />
                        </td>
                        <td className="border border-[#B08968]/20 p-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                            value={term.percentage}
                            onChange={(e) => {
                              const newTerms = [...formData.paymentTerms];
                              const percentage = parseFloat(e.target.value);
                              newTerms[index] = {
                                ...term,
                                percentage,
                                amount: term.note === 'Token' ? term.amount : (grandTotal * percentage) / 100
                              };
                              setFormData({ ...formData, paymentTerms: newTerms });
                            }}
                          />
                        </td>
                        <td className="border border-[#B08968]/20 p-2 text-right text-[#7F5539] font-medium">
                          ₹ {term.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#7F5539]">Terms & Conditions</h2>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    termsAndConditions: [...formData.termsAndConditions, '']
                  })}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B08968] text-white rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
                >
                  <Plus size={16} /> Add Term
                </button>
              </div>
              <div className="space-y-4">
                {formData.termsAndConditions.map((term, index) => (
                  <div key={index} className="flex gap-2 items-start bg-white/50 p-4 rounded-lg border border-[#B08968]/20">
                    <span className="text-[#7F5539] font-medium">{index + 1}.</span>
                    <textarea
                      className="flex-1 px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300 min-h-[60px]"
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...formData.termsAndConditions];
                        newTerms[index] = e.target.value;
                        setFormData({ ...formData, termsAndConditions: newTerms });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTerms = formData.termsAndConditions.filter((_, i) => i !== index);
                        setFormData({ ...formData, termsAndConditions: newTerms });
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300 mt-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-4 bg-[#B08968] text-white rounded-lg font-medium hover:bg-[#9C6644] transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              <span>Generate Estimate</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center bg-[#B08968]/10 p-6 rounded-lg">
            <p className="text-[#7F5539] mb-2">Thanking you</p>
            <p className="text-[#7F5539] font-semibold mb-2">JK Interiors, Jashwanth & Kushal Deep</p>
            <div className="flex flex-wrap justify-center gap-4">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-[#7F5539]">{phone}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default React.memo(CreateBill);