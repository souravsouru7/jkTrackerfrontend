import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createBill, generatePDF } from '../../store/slice/interiorBillingSlice';
import { Plus, Trash2, FileText, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../pages/Navbar';

const CreateBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    title: 'Mr',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
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
      'Scope of Work: The scope of work outlined in this quotation includes the services and deliverables as discussed and agreed upon between the client and the designer. Any additional services or changes to the scope will be subject to additional charges.',
      'Payment: A non-refundable deposit of 40% of the total estimated cost is required before work commences. The remaining balance will be invoiced at various stages of the project, as specified in the payment schedule. Payments are to be made within 7 days of receiving the invoice.',
      'Changes and Revisions: Any changes or revisions to the project scope, design, or deliverables requested by the client may incur additional charges. Changes will be discussed and agreed upon in writing before implementation.',
      'Cancellation: In the event of project cancellation by the client, the non-refundable deposit will not be returned. Any work completed up to the cancellation date will be billed at an hourly rate.',
      'Client Responsibilities: The client is responsible for providing accurate and timely information required for the project, as well as access to the project site as needed. Any delays caused by the client may impact the project timeline and could result in additional charges.',
      'Liability: The designer is not responsible for any damage, loss, or injury resulting from the client\'s use of the design, products, or services. The client is responsible for obtaining appropriate insurance for the project.',
      'Intellectual Property: Any intellectual property rights arising from the design, including sketches, drawings, and concepts, remain the property of the designer unless otherwise agreed upon in writing.',
      'Confidentiality: Both parties agree to keep all project-related information confidential, unless required by law.',
      'Dispute Resolution: In the event of a dispute, both parties agree to attempt to resolve the matter through mediation or arbitration before pursuing legal action.',
      'Force Majeure: Neither party shall be held liable for delays or failure to perform due to circumstances beyond their control, such as natural disasters or other unforeseen events.',
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
    try {
      const updatedPaymentTerms = formData.paymentTerms.map(term => ({
        ...term,
        amount: term.note === 'Token' ? term.amount : (grandTotal * term.percentage) / 100
      }));

      const billData = {
        ...formData,
        paymentTerms: updatedPaymentTerms,
        grandTotal
      };

      console.log('Submitting bill data:', billData);

      // First create the bill
      const response = await dispatch(createBill(billData)).unwrap();
      console.log('Bill creation response:', response);

      if (!response || !response._id) {
        throw new Error('Failed to create bill: Invalid response from server');
      }

      // Then generate the PDF
      console.log('Generating PDF for bill ID:', response._id);
      await dispatch(generatePDF(response._id)).unwrap();
      console.log('PDF generated successfully');

      // Show success message
      alert('Bill created and PDF generated successfully!');

      // Navigate to bills list after successful creation
      navigate('/bills');
    } catch (error) {
      console.error('Error in bill creation/PDF generation:', error);
      alert(error.message || 'Failed to create bill or generate PDF. Please try again.');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] pt-14 md:pt-0">
      <div className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-3 sm:p-6 md:p-8">
          {/* Company Header */}
          <div className="mb-8 text-center relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate('/bills');
              }}
              className="absolute left-0 top-0 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#7F5539] text-white text-sm sm:text-base rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
            >
              <List size={16} /> <span className="hidden sm:inline">View All Bills</span>
            </button>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#7F5539] mb-2">{formData.companyDetails.name}</h1>
            <p className="text-sm sm:text-base text-[#9C6644]">{formData.companyDetails.address}</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-sm sm:text-base text-[#7F5539]">{phone}</p>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Client and Bill Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539] mb-2 sm:mb-3">Client Details</h2>
                <div className="flex gap-2 sm:gap-4">
                  <select
                    className="w-20 sm:w-24 px-2 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Client Name"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Client Email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Client Phone"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Client Address"
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                  required
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539] mb-2 sm:mb-3">Bill Details</h2>
                <input
                  type="date"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={formData.billDate}
                  onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539]">Items</h2>
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
                  className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#B08968] text-white text-sm sm:text-base rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[800px] p-3 sm:p-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#B08968]/10">
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Particular</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Description</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Unit</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Width</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Height</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Sft</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Price</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Total</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-[#B08968]/5">
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <input
                              type="text"
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={item.particular}
                              onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
                              required
                            />
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <textarea
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300 min-h-[60px]"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <select
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            >
                              <option value="Sft">Sft</option>
                              <option value="Lump">Lump</option>
                            </select>
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            {item.unit === 'Sft' ? (
                              <input
                                type="number"
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                value={item.width || ''}
                                onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value))}
                                required
                              />
                            ) : '-'}
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            {item.unit === 'Sft' ? (
                              <input
                                type="number"
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                value={item.height || ''}
                                onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value))}
                                required
                              />
                            ) : '-'}
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-center text-[#7F5539] text-sm sm:text-base">
                            {item.unit === 'Sft' ? (item.width * item.height).toFixed(2) : '-'}
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <input
                              type="number"
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={item.pricePerUnit || ''}
                              onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value))}
                              required
                            />
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-right text-[#7F5539] font-medium text-sm sm:text-base">
                            ₹ {item.total.toLocaleString('en-IN')}
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
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
              </div>

              <div className="mt-4 text-right">
                <div className="inline-block bg-[#B08968]/10 p-3 sm:p-4 rounded-lg">
                  <span className="text-lg sm:text-xl font-semibold text-[#7F5539]">
                    GRAND TOTAL: ₹ {grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539]">Terms of Payment</h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[600px] p-3 sm:p-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#B08968]/10">
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Stage</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">% of Amount</th>
                        <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.paymentTerms.map((term, index) => (
                        <tr key={index} className="hover:bg-[#B08968]/5">
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <input
                              type="text"
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                              value={term.stage}
                              onChange={(e) => {
                                const newTerms = [...formData.paymentTerms];
                                newTerms[index] = { ...term, stage: e.target.value };
                                setFormData({ ...formData, paymentTerms: newTerms });
                              }}
                            />
                          </td>
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                            <input
                              type="number"
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
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
                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-right text-[#7F5539] font-medium text-sm sm:text-base">
                            ₹ {term.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539]">Terms & Conditions</h2>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    termsAndConditions: [...formData.termsAndConditions, '']
                  })}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#B08968] text-white text-sm sm:text-base rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
                >
                  <Plus size={16} /> Add Term
                </button>
              </div>
              <div className="space-y-2">
                {formData.termsAndConditions.map((term, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-grow">
                      <div className="flex items-start gap-2">
                        <span className="text-[#7F5539] font-medium mt-2 sm:mt-3 text-sm sm:text-base">{index + 1}.</span>
                        <textarea
                          value={term}
                          onChange={(e) => {
                            const newTerms = [...formData.termsAndConditions];
                            newTerms[index] = e.target.value;
                            setFormData({ ...formData, termsAndConditions: newTerms });
                          }}
                          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300 min-h-[60px]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTerms = formData.termsAndConditions.filter((_, i) => i !== index);
                        setFormData({ ...formData, termsAndConditions: newTerms });
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300 mt-3"
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
              className="w-full p-3 sm:p-4 bg-[#B08968] text-white text-sm sm:text-base rounded-lg font-medium hover:bg-[#9C6644] transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              <span>Generate Estimate</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center bg-[#B08968]/10 p-4 sm:p-6 rounded-lg">
            <p className="text-sm sm:text-base text-[#7F5539] mb-2">Thanking you</p>
            <p className="text-sm sm:text-base text-[#7F5539] font-semibold mb-2">JK Interiors, Jashwanth & Kushal Deep</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-sm sm:text-base text-[#7F5539]">{phone}</p>
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