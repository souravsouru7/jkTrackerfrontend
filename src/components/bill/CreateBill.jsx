import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBill, generatePDF } from '../../store/slice/interiorBillingSlice';
import { Plus, Minus, FileText, Trash2, Menu } from 'lucide-react';

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
      { stage: 'Confirmation advance with work order', percentage: 0, amount: 50000, note: 'Token' },
      { stage: 'Material advance', percentage: 50, amount: 0 },
      { stage: 'After completion of box work', percentage: 20, amount: 0 },
      { stage: 'At the time of finishes like polishing and painting', percentage: 20, amount: 0 },
      { stage: 'On total handover with completion of check list', percentage: 10, amount: 0 }
    ],
    termsAndConditions: [
      'It will take 2 days to start the work in site after getting the basic advance, because we need to finalise the concept and drawings as per the concept selected',
      'Taxes as applicable if required',
      'Water and power should be arranged by the client',
      'This is estimated quotation just to understand the budget, final billing will be done as per actuals on site',
      'Price\'s coated are valid up to 30 days only',
      'All visible internal surfaces are finished in .8 mm white or half white laminate',
      'All External surfaces are finished with 1mm thick laminate of sf or glossy grade of reputed make',
      'Scope of Work: The scope of work outlined in this quotation includes the services and deliverables as discussed and agreed upon between the client and the designer.',
      'Payment: A non-refundable deposit is required before work commences. The remaining balance will be invoiced at various stages of the project.',
      'Changes and Revisions: Any changes or revisions to the project scope may incur additional charges.'
    ]
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const calculateItemTotal = (item) => {
    if (item.unit === 'Sft') {
      const sft = item.width * item.height;
      return sft * item.pricePerUnit;
    }
    return item.pricePerUnit;
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index], [field]: value };
    
    if (field === 'width' || field === 'height' || field === 'pricePerUnit') {
      updatedItem.sft = updatedItem.width * updatedItem.height;
      updatedItem.total = calculateItemTotal(updatedItem);
    }
    
    newItems[index] = updatedItem;
    setFormData({ ...formData, items: newItems });
  };

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

  const MobileItemCard = ({ item, index }) => (
    <div className="bg-white/70 rounded-lg p-4 mb-4 shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-[#7F5539]">Item {index + 1}</h3>
        <button
          type="button"
          onClick={() => {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
          }}
          className="text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Particular */}
        <div className="space-y-1">
          <label className="text-sm text-[#7F5539]">Particular</label>
          <input
            type="text"
            placeholder="Particular"
            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
            value={item.particular}
            onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
            required
          />
        </div>
        
        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm text-[#7F5539]">Description</label>
          <textarea
            placeholder="Description"
            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70 min-h-[80px]"
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            required
          />
        </div>
        
        {/* Unit and Price Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm text-[#7F5539]">Unit</label>
            <select
              className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
              value={item.unit}
              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
            >
              <option value="Sft">Sft</option>
              <option value="Lump">Lump</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-[#7F5539]">Price/Unit</label>
            <input
              type="number"
              placeholder="Price/Unit"
              className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
              value={item.pricePerUnit || ''}
              onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value))}
              required
            />
          </div>
        </div>
        
        {/* Dimensions */}
        {item.unit === 'Sft' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-sm text-[#7F5539]">Width</label>
              <input
                type="number"
                placeholder="Width"
                className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                value={item.width || ''}
                onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-[#7F5539]">Height</label>
              <input
                type="number"
                placeholder="Height"
                className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                value={item.height || ''}
                onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value))}
                required
              />
            </div>
          </div>
        )}
        
        {/* SFT Display */}
        {item.unit === 'Sft' && (
          <div className="bg-[#7F5539]/10 p-2 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#7F5539]">Square Feet:</span>
              <span className="font-semibold text-[#7F5539]">
                {(item.width * item.height).toFixed(2)} Sft
              </span>
            </div>
          </div>
        )}
        
        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t border-[#B08968]/20">
          <span className="text-sm text-[#7F5539]">Total:</span>
          <span className="font-semibold text-[#7F5539]">₹ {item.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 bg-[#7F5539]/10 rounded-xl p-4 sm:p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#7F5539]">{formData.companyDetails.name}</h1>
            <p className="text-[#9C6644] mt-2 text-sm sm:text-base">{formData.companyDetails.address}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-2">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-[#B08968]">{phone}</p>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Customer Details */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/50 rounded-xl p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#7F5539] mb-4">Customer Details</h2>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full p-3 border border-[#B08968]/20 rounded-lg bg-white/70"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                />
              </div>
              <div className="bg-white/50 rounded-xl p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#7F5539] mb-4">Bill Details</h2>
                <input
                  type="date"
                  className="w-full p-3 border border-[#B08968]/20 rounded-lg bg-white/70"
                  value={formData.billDate}
                  onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white/50 rounded-xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#7F5539]">Items</h2>
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
                  className="flex items-center gap-2 bg-[#B08968] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-[#9C6644] transition-colors text-sm sm:text-base"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>

              {/* Mobile view */}
              <div className="sm:hidden">
                {formData.items.map((item, index) => (
                  <MobileItemCard key={index} item={item} index={index} />
                ))}
              </div>

              {/* Desktop view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#7F5539]/10">
                      <th className="p-3 text-left text-[#7F5539] font-semibold">Particular</th>
                      <th className="p-3 text-left text-[#7F5539] font-semibold w-1/4">Description</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Unit</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Width</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Height</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Sft</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Price</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Total</th>
                      <th className="p-3 text-[#7F5539] font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b border-[#B08968]/20">
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                            value={item.particular}
                            onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
                            required
                          />
                        </td>
                        <td className="p-3">
                          <textarea
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            required
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          >
                             <option value="Sft">Sft</option>
                            <option value="Lump">Lump</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {item.unit === 'Sft' ? (
                            <input
                              type="number"
                              className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                              value={item.width || ''}
                              onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value))}
                              required
                            />
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          {item.unit === 'Sft' ? (
                            <input
                              type="number"
                              className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                              value={item.height || ''}
                              onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value))}
                              required
                            />
                          ) : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {item.unit === 'Sft' ? (item.width * item.height).toFixed(2) : '-'}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                            value={item.pricePerUnit || ''}
                            onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value))}
                            required
                          />
                        </td>
                        <td className="p-3 text-right font-semibold text-[#7F5539]">
                          ₹ {item.total.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = formData.items.filter((_, i) => i !== index);
                              setFormData({ ...formData, items: newItems });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-right">
                <div className="inline-block bg-[#7F5539]/10 rounded-lg p-4">
                  <span className="text-xl sm:text-2xl font-bold text-[#7F5539]">
                    GRAND TOTAL: ₹ {grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms - Mobile */}
            <div className="bg-white/50 rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#7F5539] mb-4">Terms of Payment</h2>
              <div className="block sm:hidden space-y-4">
                {formData.paymentTerms.map((term, index) => (
                  <div key={index} className="bg-white/70 rounded-lg p-4">
                    <input
                      type="text"
                      className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70 mb-2"
                      value={term.stage}
                      onChange={(e) => {
                        const newTerms = [...formData.paymentTerms];
                        newTerms[index] = { ...term, stage: e.target.value };
                        setFormData({ ...formData, paymentTerms: newTerms });
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 p-2 border border-[#B08968]/20 rounded-lg bg-white/70 text-right"
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
                        placeholder="%"
                      />
                      <div className="w-1/2 p-2 bg-[#7F5539]/10 rounded-lg text-right font-semibold text-[#7F5539]">
                        ₹ {term.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Terms - Desktop */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#7F5539]/10">
                      <th className="p-3 text-left text-[#7F5539] font-semibold">Stage</th>
                      <th className="p-3 text-right text-[#7F5539] font-semibold">% of Amount</th>
                      <th className="p-3 text-right text-[#7F5539] font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paymentTerms.map((term, index) => (
                      <tr key={index} className="border-b border-[#B08968]/20">
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70"
                            value={term.stage}
                            onChange={(e) => {
                              const newTerms = [...formData.paymentTerms];
                              newTerms[index] = { ...term, stage: e.target.value };
                              setFormData({ ...formData, paymentTerms: newTerms });
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-full p-2 border border-[#B08968]/20 rounded-lg bg-white/70 text-right"
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
                        <td className="p-3 text-right font-semibold text-[#7F5539]">
                          ₹ {term.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white/50 rounded-xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#7F5539]">Terms & Conditions</h2>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    termsAndConditions: [...formData.termsAndConditions, '']
                  })}
                  className="flex items-center gap-2 bg-[#B08968] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-[#9C6644] transition-colors text-sm sm:text-base"
                >
                  <Plus size={18} /> Add Term
                </button>
              </div>
              <div className="space-y-4">
                {formData.termsAndConditions.map((term, index) => (
                  <div key={index} className="flex gap-3 items-start bg-white/70 rounded-lg p-3">
                    <span className="text-[#7F5539] font-semibold mt-2">{index + 1}.</span>
                    <textarea
                      className="flex-1 p-2 border border-[#B08968]/20 rounded-lg bg-white/70 min-h-[80px]"
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
                      className="text-red-500 hover:text-red-600 mt-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#7F5539] text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[#9C6644] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <FileText size={24} />
              Generate Estimate
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center bg-[#7F5539]/10 rounded-xl p-4 sm:p-6">
            <p className="font-medium text-[#7F5539]">Thanking you</p>
            <p className="font-medium text-[#7F5539] text-base sm:text-lg">JK Interiors, Jashwanth & Kushal Deep</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-2">
              {formData.companyDetails.phones.map(phone => (
                <p key={phone} className="text-[#B08968]">{phone}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateBill);