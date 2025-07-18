import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBill, fetchBillById, clearCurrentBill, generatePDF } from '../../store/slice/interiorBillingSlice';
import { Plus, Trash2, FileText, List } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../pages/Navbar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EditBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentBill, loading } = useSelector((state) => state.interiorBilling);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    billNumber: '',
    documentType: 'Invoice',
    billDate: new Date().toISOString().split('T')[0],
    title: 'None',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    items: [{
      particular: '',
      description: 'Providing and fixing of Table with 12mm plywood with necessary laminate and hardware',
      unit: 'Sft',
      quantity: 1,
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

  const [predefinedDescriptions] = useState([
    'Providing and fixing 18mm HDHMR & Hafele hardware with required Adhesive\'s and selected laminates',
    'Providing and fixing 18mm HDHMR & Hafele Hardware with required Adhesive\'s and Selected Acrylic laminates',
    'Providing and fixing of Havels wires with required electrical items includes \nLights (Philips, Crompton, Wipro)\nSwitch board (GM, Gold medal)',
    'Providing and installing 2 coats of Royal Asian Paints with selected colours',
    'Providing and fixing of selected wall cladding with Ganesh',
    'Providing and fixing with Natural stone (limestone) wall cladding and unit box'
  ]);

  const [predefinedTerms] = useState([
    'It will take 2 days to start the work in site after getting the basic advance, because we need to finalise the concept and drawings as per the concept selected',
    'The work will be completed within the specified timeline once started',
    'All materials used will be of high quality and as per industry standards',
    'Any changes to the design after work commencement may incur additional charges',
    'Payment terms are non-negotiable and must be adhered to as per the agreement',
    'Warranty period is 1 year from the date of completion for any manufacturing defects',
    'The company is not responsible for any damage caused by natural calamities or misuse'
  ]);

  const [selectedTerms, setSelectedTerms] = useState({});

  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    dispatch(fetchBillById(id));
    return () => {
      dispatch(clearCurrentBill());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBill) {
      const initialSelectedTerms = {};
      currentBill.termsAndConditions.forEach(term => {
        const index = predefinedTerms.indexOf(term);
        if (index !== -1) {
          initialSelectedTerms[index] = true;
        }
      });
      setSelectedTerms(initialSelectedTerms);
      const discountType = currentBill.discount > 0 
        ? (currentBill.discount / currentBill.grandTotal) * 100 > 1 
          ? 'percentage' 
          : 'amount'
        : 'amount';
      
      const discountValue = discountType === 'percentage'
        ? (currentBill.discount / currentBill.grandTotal) * 100
        : currentBill.discount;

      setDiscountType(discountType);
      setDiscountValue(discountValue);
      
      // Format the date properly
      const billDate = currentBill.date 
        ? new Date(currentBill.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        ...currentBill,
        billDate: billDate,
        discountType,
        discountValue
      });
    }
  }, [currentBill, predefinedTerms]);

  const calculateItemTotal = useCallback((item) => {
    if (item.unit === 'Sft') {
      const sft = (item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss'))
        ? item.width * item.height * (item.depth || 1)
        : item.width * item.height;
      return sft * item.pricePerUnit * (item.quantity || 1);
    }
    return item.pricePerUnit * (item.quantity || 1);
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prevData => {
      const newItems = [...prevData.items];
      const updatedItem = { ...newItems[index], [field]: value };
      
      if (field === 'width' || field === 'height' || field === 'depth' || field === 'pricePerUnit' || field === 'quantity') {
        updatedItem.sft = (updatedItem.description?.toLowerCase().includes('ms') || updatedItem.description?.toLowerCase().includes('ss'))
          ? updatedItem.width * updatedItem.height * (updatedItem.depth || 1)
          : updatedItem.width * updatedItem.height;
        updatedItem.total = calculateItemTotal(updatedItem);
      }
      
      newItems[index] = updatedItem;
      return { ...prevData, items: newItems };
    });
  }, [calculateItemTotal]);

  const grandTotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + itemTotal;
    }, 0);
  }, [formData.items, calculateItemTotal]);

  // Calculate final amount after discount
  const finalAmount = useMemo(() => {
    const discount = discountType === 'percentage'
      ? (grandTotal * discountValue) / 100
      : discountValue;
    return grandTotal - discount;
  }, [grandTotal, discountType, discountValue]);

  // Calculate per-item discount (equally distributed)
  const perItemDiscount = useMemo(() => {
    if (formData.items.length === 0) return 0;
    const totalDiscount = discountType === 'percentage'
      ? (grandTotal * discountValue) / 100
      : discountValue;
    return totalDiscount / formData.items.length;
  }, [discountType, discountValue, grandTotal, formData.items.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Calculate final totals for all items
      const calculatedItems = formData.items.map(item => ({
        ...item,
        total: calculateItemTotal(item),
        squareFeet: item.unit === 'Sft' ? item.width * item.height : undefined,
        quantity: item.quantity || 1
      }));

      const updatedPaymentTerms = formData.paymentTerms.map(term => ({
        ...term,
        amount: term.note === 'Token' ? term.amount : (grandTotal * term.percentage) / 100
      }));

      const billData = {
        ...formData,
        items: calculatedItems,
        paymentTerms: updatedPaymentTerms,
        grandTotal,
        discount: discountType === 'percentage' 
          ? (grandTotal * discountValue) / 100 
          : discountValue || 0,
        finalAmount: finalAmount
      };

      console.log('Submitting bill data:', billData);

      const response = await dispatch(updateBill({ id, billData })).unwrap();
      console.log('Bill update response:', response);

      if (!response || !response._id) {
        throw new Error('Failed to update bill: Invalid response from server');
      }

      console.log('Generating PDF for bill ID:', response._id);
      await dispatch(generatePDF(response._id)).unwrap();
      console.log('PDF generated successfully');

      alert('Bill updated and PDF generated successfully!');
      navigate('/bills');
    } catch (error) {
      console.error('Error in bill update/PDF generation:', error);
      alert(error.message || 'Failed to update bill or generate PDF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(formData.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormData(prev => ({
      ...prev,
      items: items
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F5539]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-6 md:p-8">
            {message.text && (
              <div 
                className={`mb-4 p-4 rounded-lg animate-fadeIn ${
                  message.type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : message.type === 'error'
                    ? 'bg-red-100 border border-red-400 text-red-700'
                    : message.type === 'loading'
                    ? 'bg-blue-100 border border-blue-400 text-blue-700'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === 'loading' && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  )}
                  {message.text}
                </div>
              </div>
            )}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#7F5539]">Edit Bill</h1>
              <p className="text-[#9C6644] mt-2">Update the bill details below</p>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="space-y-6 transition-opacity duration-800 ease-in-out"
            >
              {/* Document Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[#7F5539]">Document Type</span>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                    >
                      <option value="Invoice">Invoice</option>
                      <option value="Estimate">Estimate</option>
                      <option value="Quotation">Quotation</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-[#7F5539]">Bill Details</h2>
                  
                  <label className="block">
                    <span className="text-[#7F5539]">Bill Number</span>
                    <input
                      type="text"
                      value={formData.billNumber}
                      disabled
                      className="mt-1 block w-full rounded-md border-[#B08968] bg-gray-100 shadow-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#7F5539]">Bill Date</span>
                    <input
                      type="date"
                      value={formData.billDate}
                      onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                    />
                  </label>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-[#7F5539]">Customer Details</h2>
                  
                  <div className="flex gap-4">
                    <label className="block w-24">
                      <span className="text-[#7F5539]">Title</span>
                      <select
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                      >
                        <option value="None">None</option>
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                      </select>
                    </label>

                    <label className="block flex-1">
                      <span className="text-[#7F5539]">Name</span>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-[#7F5539]">Email</span>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#7F5539]">Phone</span>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#7F5539]">Address</span>
                    <textarea
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#7F5539]">Items</h2>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      items: [...prev.items, {
                        particular: '',
                        description: '',
                        unit: 'Sft',
                        quantity: 1,
                        width: 0,
                        height: 0,
                        sft: 0,
                        pricePerUnit: 0,
                        total: 0
                      }]
                    }))}
                    className="bg-[#7F5539] text-white px-3 py-1 rounded-lg hover:bg-[#9C6644] transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="items">
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-[#7F5539]/10 rounded-lg p-2' : ''}`}
                      >
                        {formData.items.map((item, index) => (
                          <Draggable key={index} draggableId={`item-${index}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-4 ${
                                  snapshot.isDragging 
                                    ? 'shadow-lg ring-2 ring-[#7F5539] rounded-lg' 
                                    : ''
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  touchAction: 'none' // Prevents scrolling while dragging on mobile
                                }}
                              >
                                <div className={`p-4 bg-white/50 rounded-lg space-y-4 ${
                                  snapshot.isDragging ? 'opacity-90' : ''
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <div 
                                      {...provided.dragHandleProps} 
                                      className="flex items-center gap-2 touch-none cursor-grab active:cursor-grabbing"
                                    >
                                      <List size={16} className="text-[#7F5539]" />
                                      <h3 className="font-medium text-[#7F5539]">Item {index + 1}</h3>
                                    </div>
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                          ...prev,
                                          items: prev.items.filter((_, i) => i !== index)
                                        }))}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                      <span className="text-[#7F5539]">Particular</span>
                                      <input
                                        type="text"
                                        value={item.particular}
                                        onChange={(e) => handleItemChange(index, 'particular', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                      />
                                    </label>

                                    <label className="block">
                                      <span className="text-[#7F5539]">Quantity</span>
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.quantity || 1}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                      />
                                    </label>

                                    <label className="block">
                                      <span className="text-[#7F5539]">Description</span>
                                      <select
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                      >
                                        <option value="">Select or type a description</option>
                                        {predefinedDescriptions.map((desc, i) => (
                                          <option key={i} value={desc}>{desc}</option>
                                        ))}
                                      </select>
                                      {item.description === "" && (
                                        <input
                                          type="text"
                                          placeholder="Or type a custom description"
                                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                          className="mt-2 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                        />
                                      )}
                                    </label>

                                    <label className="block">
                                      <span className="text-[#7F5539]">Unit</span>
                                      <select
                                        value={item.unit}
                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                      >
                                        <option value="Sft">Sft</option>
                                        <option value="Ls">Ls</option>
                                      </select>
                                    </label>

                                    {item.unit === 'Sft' && (
                                      <>
                                        <label className="block w-24">
                                          <span className="text-[#7F5539]">Width</span>
                                          <input
                                            type="number"
                                            value={item.width}
                                            onChange={(e) => handleItemChange(index, 'width', parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50 text-sm px-2 py-1"
                                          />
                                        </label>

                                        <label className="block w-24">
                                          <span className="text-[#7F5539]">Height</span>
                                          <input
                                            type="number"
                                            value={item.height}
                                            onChange={(e) => handleItemChange(index, 'height', parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50 text-sm px-2 py-1"
                                          />
                                        </label>

                                        {(item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss')) && (
                                          <label className="block">
                                            <span className="text-[#7F5539]">Depth</span>
                                            <input
                                              type="number"
                                              value={item.depth || ''}
                                              onChange={(e) => handleItemChange(index, 'depth', parseFloat(e.target.value) || 0)}
                                              className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                            />
                                          </label>
                                        )}
                                      </>
                                    )}

                                    <label className="block">
                                      <span className="text-[#7F5539]">Price Per Unit</span>
                                      <input
                                        type="number"
                                        value={item.pricePerUnit}
                                        onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full rounded-md border-[#B08968] shadow-sm focus:border-[#7F5539] focus:ring focus:ring-[#7F5539] focus:ring-opacity-50"
                                      />
                                    </label>

                                    <div className="block">
                                      <span className="text-[#7F5539]">Total</span>
                                      <div className="mt-1 block w-full p-2 bg-gray-50 rounded-md border border-[#B08968]">
                                        ₹{item.total.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="block">
                                      <span className="text-[#7F5539]">Discount</span>
                                      <div className="mt-1 block w-full p-2 bg-gray-50 rounded-md border border-[#B08968]">
                                        ₹{perItemDiscount.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="block">
                                      <span className="text-[#7F5539]">Net Total</span>
                                      <div className="mt-1 block w-full p-2 bg-gray-50 rounded-md border border-[#B08968]">
                                        ₹{(item.total - perItemDiscount).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add this button at the bottom of each item */}
                                  <div className="flex justify-center pt-4 border-t border-[#7F5539]/10 mt-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newItems = [...formData.items];
                                        newItems.splice(index + 1, 0, {
                                          particular: '',
                                          description: '',
                                          unit: 'Sft',
                                          quantity: 1,
                                          width: 0,
                                          height: 0,
                                          sft: 0,
                                          pricePerUnit: 0,
                                          total: 0
                                        });
                                        setFormData(prev => ({ ...prev, items: newItems }));
                                      }}
                                      className="w-full md:w-auto px-4 py-2 bg-[#7F5539]/5 text-[#7F5539] rounded-lg 
                                      hover:bg-[#7F5539] hover:text-white transition-all duration-300 
                                      flex items-center justify-center gap-2 font-medium
                                      shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                      <Plus size={16} className="flex-shrink-0" /> 
                                      <span>Add Item Below</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Grand Total */}
              <div className="mt-4 space-y-4">
                {/* Subtotal */}
                <div className="text-right">
                  <div className="inline-block bg-[#B08968]/10 p-3 sm:p-4 rounded-lg">
                    <span className="text-lg sm:text-xl font-semibold text-[#7F5539]">
                      SUBTOTAL: ₹ {grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Discount Section */}
                <div className="flex flex-col md:flex-row gap-4 items-end justify-end">
                  <div className="flex gap-4 items-center">
                    <label className="space-y-1">
                      <span className="text-[#7F5539] text-sm font-medium">Discount Type</span>
                      <select
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value);
                          setDiscountValue(0);
                          setFormData(prev => ({
                            ...prev,
                            discountType: e.target.value,
                            discountValue: 0
                          }));
                        }}
                        className="block w-40 px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg 
                                  text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                      >
                        <option value="amount">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </label>
                    
                    <label className="space-y-1">
                      <span className="text-[#7F5539] text-sm font-medium">
                        Discount {discountType === 'percentage' ? '(%)' : '(₹)'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'percentage' ? "100" : grandTotal}
                        value={discountValue}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setDiscountValue(value);
                          setFormData(prev => ({
                            ...prev,
                            discountValue: value
                          }));
                        }}
                        className="block w-32 px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg 
                                  text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                      />
                    </label>
                  </div>
                </div>

                {/* Final Amount */}
                <div className="text-right">
                  <div className="inline-block bg-[#7F5539] p-3 sm:p-4 rounded-lg">
                    <span className="text-lg sm:text-xl font-semibold text-white">
                      FINAL AMOUNT: ₹ {finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#7F5539]">Terms & Conditions</h2>
                </div>
                <div className="space-y-2">
                  {predefinedTerms.map((term, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="checkbox"
                        checked={selectedTerms[index] || false}
                        onChange={(e) => {
                          const newSelectedTerms = { ...selectedTerms };
                          if (e.target.checked) {
                            newSelectedTerms[index] = true;
                          } else {
                            delete newSelectedTerms[index];
                          }
                          setSelectedTerms(newSelectedTerms);
                          
                          const selectedTermsList = Object.keys(newSelectedTerms)
                            .map(idx => predefinedTerms[parseInt(idx)])
                            .filter(Boolean);
                          
                          setFormData(prev => ({
                            ...prev,
                            termsAndConditions: selectedTermsList
                          }));
                        }}
                        className="mt-1 rounded text-[#7F5539] focus:ring-[#7F5539]"
                      />
                      <div className="flex-grow">
                        <div className="flex items-start gap-2">
                          <span className="text-[#7F5539] font-medium">{index + 1}.</span>
                          <div className="w-full px-4 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539]">
                            {term}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 mb-4 md:mb-0">
                <button
                  type="button"
                  onClick={() => navigate('/bills')}
                  className="px-6 py-2 border border-[#7F5539] text-[#7F5539] rounded-lg hover:bg-[#7F5539] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7F5539] text-white rounded-lg hover:bg-[#9C6644] transition-colors flex items-center gap-2"
                >
                  <FileText size={16} /> Update Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBill;
