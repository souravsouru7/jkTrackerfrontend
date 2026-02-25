import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { createBill, generatePDF } from '../../store/slice/interiorBillingSlice';
import { Plus, Trash2, FileText, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../pages/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '../Loader';

const CreateBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get document type from location state or default to 'Invoice'
  const [documentType, setDocumentType] = useState(location.state?.documentType || 'Invoice');

  const [materials] = useState(['HDHMR', 'MDF', 'Particle Board', 'P/MWood',"MS","SS"]);
  const [thicknesses] = useState(['1mm','2mm','3mm','4mm','5mm','6mm',"7mm",'8mm',"9mm","10mm",'12mm',"16mm",'18mm', '25mm']);
  const [hardwareBrands] = useState(['Godrej', 'Ebco', 'Hafele', 'Hettich',"appolo"]);


  
  const workTypeOptions = {
    all: {
      materials: [
        // Carpenter materials
        'HDHMR', 'MDF', 'Particle Board', 'P/MWood', "MS", "SS",
        // Glass materials
        'Clear Glass', 'Frosted Glass', 'Tinted Glass', 'Mirror', 'Tempered Glass', 'Laminated Glass',
        // Painter materials
        'Emulsion', 'Enamel', 'Textured', 'Metallic', 'Wood Finish', 'Wall Putty'
      ],
      thicknesses: [
        // Carpenter thicknesses
        '1mm','2mm','3mm','4mm','5mm','6mm',"7mm",'8mm',"9mm","10mm",'12mm',"16mm",'18mm', '25mm',
        // Glass thicknesses
        '4mm', '6mm', '8mm', '10mm', '12mm',
        // Painter thicknesses
        '1 Coat', '2 Coats', '3 Coats'
      ],
      brands: [
        // Carpenter brands
        'Godrej', 'Ebco', 'Hafele', 'Hettich', "appolo",
        // Glass brands
        'Saint Gobain', 'Asahi', 'Guardian', 'HNG', 'Gold Plus',
        // Painter brands
        'Asian Paints', 'Berger', 'Dulux', 'Nerolac', 'Indigo'
      ]
    }
  };

  const getCategoryOptions = (category) => {
    switch(category) {
      case 'carpenter':
        return {
          materials: ['None', 'HDHMR', 'MDF', 'Particle Board', 'P/MWood', "MS", "SS"],
          thicknesses: ['None', '1mm','2mm','3mm','4mm','5mm','6mm',"7mm",'8mm',"9mm","10mm",'12mm',"16mm",'18mm', '25mm'],
          brands: ['None', 'Godrej', 'Ebco', 'Hafele', 'Hettich', "appolo"]
        };
      case 'glasses':
        return {
          materials: ['None', 'Clear Glass', 'Frosted Glass', 'Tinted Glass', 'Mirror', 'Tempered Glass', 'Laminated Glass'],
          thicknesses: ['None', '4mm', '6mm', '8mm', '10mm', '12mm'],
          brands: ['None', 'Saint Gobain', 'Asahi', 'Guardian', 'HNG', 'Gold Plus']
        };
      case 'painter':
        return {
          materials: ['None', 'Emulsion', 'Enamel', 'Textured', 'Metallic', 'Wood Finish', 'Wall Putty'],
          thicknesses: ['None', '1 Coat', '2 Coats', '3 Coats'],
          brands: ['None', 'Asian Paints', 'Berger', 'Dulux', 'Nerolac', 'Indigo']
        };
      default:
        return {
          materials: ['None'],
          thicknesses: ['None'],
          brands: ['None']
        };
    }
  };

  const generateDescription = (material, thickness, brand, category) => {
    if (category === 'none') {
      return '';
    }
    
    const materialText = material === 'None' ? '' : `${material} `;
    const brandText = brand === 'None' ? '' : `& ${brand} Hardware`;
    const thicknessText = thickness === 'None' ? '' : thickness;
    
    switch(category) {
      case 'carpenter':
        if (brand === 'None') {
          return `Providing and fixing ${thicknessText} ${materialText}with required Adhesive's and Selected Acrylic laminates`;
        }
        return `Providing and fixing ${thicknessText} ${materialText}${brandText} with required Adhesive's and Selected  laminates`;
      
      case 'glasses':
        if (brand === 'None') {
          return `Supply and installation of ${thicknessText} ${materialText}glass with fittings and accessories`;
        }
        return `Supply and installation of ${thicknessText} ${materialText}glass with ${brand} fittings and accessories`;
      
      case 'painter':
        if (brand === 'None') {
          return `Supply and application of ${materialText}paint in ${thicknessText}`;
        }
        return `Supply and application of ${materialText}paint in ${thicknessText} with ${brand} brand`;
      
      default:
        return `Custom: ${materialText}${thicknessText} - ${brand}`;
    }
  };

  const extractValueFromDescription = (description, pattern) => {
    const match = description.match(pattern);
    return match ? match[1] : 'None';
  };

  const [predefinedDescriptions] = useState(() => {
    const descriptions = ['Custom'];
    const currentWorkType = 'all';
    workTypeOptions[currentWorkType].materials.forEach(material => {
      workTypeOptions[currentWorkType].thicknesses.forEach(thickness => {
        workTypeOptions[currentWorkType].brands.forEach(brand => {
          descriptions.push(generateDescription(material, thickness, brand, currentWorkType));
        });
      });
    });
    return descriptions;
  });

  const [formData, setFormData] = useState({
    billNumber: '',
    documentType: location.state?.documentType || 'Invoice',
    billDate: new Date().toISOString().split('T')[0],
    title: 'None',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    items: [{
      particular: '',
      description: generateDescription('HDHMR', '18mm', 'Hafele', 'carpenter'),
      unit: 'Sft',
      quantity: 1,
      width: 0,
      height: 0,
      sft: 0,
      pricePerUnit: 1250,
      total: 0,
      depth: 1
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
    ],
    discountType: 'amount',
    discountValue: 0
  });

  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [discountValue, setDiscountValue] = useState(0);

  // Existing calculation functions
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
    // Validation for numeric fields
    if (['width', 'height', 'depth', 'pricePerUnit', 'quantity'].includes(field)) {
      // Prevent negative numbers
      if (value < 0) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be negative. Please enter a valid positive number.`);
        return;
      }
      
      // Prevent zero for critical fields
      if (field === 'pricePerUnit' && value === 0) {
        alert('Price per unit cannot be zero. Please enter a valid price.');
        return;
      }
      
      // Validate dimensions for Sft items
      if (field === 'width' || field === 'height') {
        if (value > 10000) { // Max 10,000 units
          alert(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed 10,000. Please enter a valid dimension.`);
          return;
        }
      }
      
      // Validate depth
      if (field === 'depth' && value > 1000) {
        alert('Depth cannot exceed 1,000. Please enter a valid depth.');
        return;
      }
      
      // Validate quantity
      if (field === 'quantity' && value > 10000) {
        alert('Quantity cannot exceed 10,000. Please enter a valid quantity.');
        return;
      }
      
      // Validate price
      if (field === 'pricePerUnit' && value > 1000000) {
        alert('Price per unit cannot exceed ₹10,00,000. Please enter a valid price.');
        return;
      }
    }
    
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

  // Calculate per-item discount (percentage-based for each item)
  const calculateItemDiscount = useCallback((item) => {
    const itemTotal = calculateItemTotal(item);
    if (discountType === 'percentage') {
      return (itemTotal * discountValue) / 100;
    } else {
      // For fixed amount, distribute proportionally based on item's share of total
      if (grandTotal === 0) return 0;
      return (itemTotal / grandTotal) * discountValue;
    }
  }, [discountType, discountValue, grandTotal, calculateItemTotal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.clientName.trim()) {
      alert('Please enter client name');
      return;
    }
    
    if (!formData.clientEmail.trim()) {
      alert('Please enter client email');
      return;
    }
    
    if (!formData.clientPhone.trim()) {
      alert('Please enter client phone');
      return;
    }
    
    if (!formData.clientAddress.trim()) {
      alert('Please enter client address');
      return;
    }
    
    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      
      if (!item.particular.trim()) {
        alert(`Please enter particular for item ${i + 1}`);
        return;
      }
      
      if (item.unit === 'Sft') {
        if (!item.width || item.width <= 0) {
          alert(`Please enter valid width for item ${i + 1}`);
          return;
        }
        if (!item.height || item.height <= 0) {
          alert(`Please enter valid height for item ${i + 1}`);
          return;
        }
        if ((item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss')) && (!item.depth || item.depth <= 0)) {
          alert(`Please enter valid depth for item ${i + 1}`);
          return;
        }
      }
      
      if (!item.pricePerUnit || item.pricePerUnit <= 0) {
        alert(`Please enter valid price per unit for item ${i + 1}`);
        return;
      }
      
      if (!item.quantity || item.quantity <= 0) {
        alert(`Please enter valid quantity for item ${i + 1}`);
        return;
      }
    }
    
    // Validate discount
    if (discountValue < 0) {
      alert('Discount cannot be negative');
      return;
    }
    
    if (discountType === 'percentage' && discountValue > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }
    
    if (discountType === 'amount' && discountValue > grandTotal) {
      alert('Fixed amount discount cannot exceed the total amount');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calculate final totals for all items
      const calculatedItems = formData.items.map(item => {
        let depth = item.depth;
        // If Sft and MS/SS, ensure depth is set (default to 1 if missing)
        if (item.unit === 'Sft' && (item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss'))) {
          depth = depth === undefined || depth === null || isNaN(depth) ? 1 : depth;
        }
        // If Sft but not MS/SS, ensure depth is at least present (set to 1 if undefined)
        if (item.unit === 'Sft' && !(item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss'))) {
          depth = depth === undefined ? 1 : depth;
        }
        return {
          ...item,
          depth,
          total: calculateItemTotal({ ...item, depth }),
          squareFeet: item.unit === 'Sft' ? item.width * item.height : undefined,
          quantity: item.quantity || 1
        };
      });

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
        finalAmount: finalAmount,
        date: new Date(formData.billDate).toISOString()
      };

      console.log('Submitting bill data:', billData);

      const response = await dispatch(createBill(billData)).unwrap();
      console.log('Bill creation response:', response);

      if (!response || !response._id) {
        throw new Error('Failed to create bill: Invalid response from server');
      }

      // Wait a moment before generating PDF to ensure bill is saved
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Generating PDF for bill ID:', response._id);
      const pdfResult = await dispatch(generatePDF(response._id)).unwrap();
      console.log('PDF generation result:', pdfResult);

      if (pdfResult.success) {
        alert('Bill created and PDF generated successfully!');
        navigate('/bills');
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error in bill creation/PDF generation:', error);
      alert(error.message || 'Failed to create bill or generate PDF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] pt-20 md:pt-24"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-2 sm:p-4 md:p-8 max-w-7xl mx-auto"
        >
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <div className="bg-white p-6 rounded-lg shadow-xl">
                  <Loader />
                  <p className="mt-4 text-[#7F5539]">Generating {documentType}...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <style jsx>{`
            input, select, textarea {
              transition: all 0.3s ease;
            }
            
            input:focus, select:focus, textarea:focus {
              transform: translateY(-2px);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          `}</style>

          <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 p-3 sm:p-6 md:p-8">
            <div className="mb-8 text-center">
              <div className="flex justify-start mb-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/bills');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7F5539] text-white rounded-lg hover:bg-[#9C6644] transition-colors duration-300"
                >
                  <List size={18} />
                  <span className="text-base">View Bills</span>
                </button>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-[#7F5539] mb-3">{formData.companyDetails.name}</h1>
              <p className="text-base sm:text-lg text-[#9C6644] mb-2">{formData.companyDetails.address}</p>
              <div className="flex justify-center gap-4 sm:gap-6">
                {formData.companyDetails.phones.map(phone => (
                  <p key={phone} className="text-base sm:text-lg text-[#7F5539]">{phone}</p>
                ))}
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#7F5539]">Create New {documentType}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="mb-4">
                <label className="block text-[#7F5539] text-sm font-bold mb-2">
                  Document Type
                </label>
                <select
                  className="w-full px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                  value={documentType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setDocumentType(newType);
                    setFormData(prev => ({ ...prev, documentType: newType }));
                    navigate('.', { state: { documentType: newType }, replace: true });
                  }}
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Estimate">Estimate</option>
                </select>
              </div>

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
                      <option value="None">None</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Client Name"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Client Email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Client Phone"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Client Address"
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
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

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539]">Items</h2>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      items: [...formData.items, {
                        particular: '',
                        description: generateDescription('HDHMR', '18mm', 'Hafele', 'carpenter'),
                        unit: 'Sft',
                        quantity: 1,
                        width: 0,
                        height: 0,
                        sft: 0,
                        pricePerUnit: 1250,
                        total: 0,
                        depth: 1
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
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Qty</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Width</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Height</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Depth</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Sft</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Price</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Total</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Discount</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Net Total</th>
                          <th className="border border-[#B08968]/20 p-2 sm:p-3 text-[#7F5539] font-semibold text-sm sm:text-base">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="hover:bg-[#B08968]/5">
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
                                <div className="space-y-2">
                                  <div className="grid grid-cols-4 gap-2">
                                    <select
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                      value={item.category || 'carpenter'}
                                      onChange={(e) => {
                                        const newCategory = e.target.value;
                                        const categoryOptions = getCategoryOptions(newCategory);
                                        handleItemChange(index, 'category', newCategory);
                                        // Reset material, thickness, and brand to first options of new category
                                        handleItemChange(index, 'description', generateDescription(
                                          categoryOptions.materials[0],
                                          categoryOptions.thicknesses[0],
                                          categoryOptions.brands[0],
                                          newCategory
                                        ));
                                      }}
                                    >
                                      <option value="none">None</option>
                                      <option value="carpenter">Carpenter</option>
                                      <option value="glasses">Glass</option>
                                      <option value="painter">Painter</option>
                                    </select>
                                    <select
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                      value={extractValueFromDescription(item.description, /fixing\s(\d+mm)/) || getCategoryOptions(item.category || 'carpenter').thicknesses[0]}
                                      onChange={(e) => {
                                        const thickness = e.target.value;
                                        const material = extractValueFromDescription(item.description, /mm\s([^&\s]+)/) || getCategoryOptions(item.category || 'carpenter').materials[0];
                                        const brand = extractValueFromDescription(item.description, /&\s([^H]+)/) || getCategoryOptions(item.category || 'carpenter').brands[0];
                                        handleItemChange(index, 'description', generateDescription(material, thickness, brand, item.category || 'carpenter'));
                                      }}
                                    >
                                      {getCategoryOptions(item.category || 'carpenter').thicknesses.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                    <select
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                      value={extractValueFromDescription(item.description, /mm\s([^&\s]+)/) || getCategoryOptions(item.category || 'carpenter').materials[0]}
                                      onChange={(e) => {
                                        const material = e.target.value;
                                        const thickness = extractValueFromDescription(item.description, /fixing\s(\d+mm)/) || getCategoryOptions(item.category || 'carpenter').thicknesses[0];
                                        const brand = extractValueFromDescription(item.description, /&\s([^H]+)/) || getCategoryOptions(item.category || 'carpenter').brands[0];
                                        handleItemChange(index, 'description', generateDescription(material, thickness, brand, item.category || 'carpenter'));
                                      }}
                                    >
                                      {getCategoryOptions(item.category || 'carpenter').materials.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>
                                    <select
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                      value={extractValueFromDescription(item.description, /&\s([^H]+)/) || getCategoryOptions(item.category || 'carpenter').brands[0]}
                                      onChange={(e) => {
                                        const brand = e.target.value;
                                        const thickness = extractValueFromDescription(item.description, /fixing\s(\d+mm)/) || getCategoryOptions(item.category || 'carpenter').thicknesses[0];
                                        const material = extractValueFromDescription(item.description, /mm\s([^&\s]+)/) || getCategoryOptions(item.category || 'carpenter').materials[0];
                                        handleItemChange(index, 'description', generateDescription(material, thickness, brand, item.category || 'carpenter'));
                                      }}
                                    >
                                      {getCategoryOptions(item.category || 'carpenter').brands.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {(!predefinedDescriptions.includes(item.description) || item.description === '') && (
                                    <textarea
                                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                      value={item.description}
                                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                      placeholder="Enter custom description..."
                                      rows="3"
                                    />
                                  )}
                                </div>
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
                                                        <input
                          type="number"
                          min="1"
                          max="10000"
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                          value={item.quantity || 1}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            if (value < 1) {
                              alert('Quantity must be at least 1');
                              return;
                            }
                            if (value > 10000) {
                              alert('Quantity cannot exceed 10,000');
                              return;
                            }
                            handleItemChange(index, 'quantity', value);
                          }}
                          required
                        />
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                                {item.unit === 'Sft' ? (
                                  <input
                                    type="number"
                                    min="0.01"
                                    max="10000"
                                    step="0.01"
                                    className="w-12 px-2 py-1 bg-white/50 border border-[#B08968]/20 rounded text-sm text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                    value={item.width || ''}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (value < 0.01) {
                                        alert('Width must be at least 0.01');
                                        return;
                                      }
                                      if (value > 10000) {
                                        alert('Width cannot exceed 10,000');
                                        return;
                                      }
                                      handleItemChange(index, 'width', value);
                                    }}
                                    required
                                  />
                                ) : '-'}
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                                {item.unit === 'Sft' ? (
                                  <input
                                    type="number"
                                    min="0.01"
                                    max="10000"
                                    step="0.01"
                                    className="w-12 px-2 py-1 bg-white/50 border border-[#B08968]/20 rounded text-sm text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                    value={item.height || ''}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (value < 0.01) {
                                        alert('Height must be at least 0.01');
                                        return;
                                      }
                                      if (value > 10000) {
                                        alert('Height cannot exceed 10,000');
                                        return;
                                      }
                                      handleItemChange(index, 'height', value);
                                    }}
                                    required
                                  />
                                ) : '-'}
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                                {item.unit === 'Sft' && (item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss')) ? (
                                  <input
                                    type="number"
                                    min="0.01"
                                    max="1000"
                                    step="0.01"
                                    className="w-20 px-2 py-1 bg-white/50 border border-[#B08968]/20 rounded text-sm text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                    value={item.depth || ''}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (value < 0.01) {
                                        alert('Depth must be at least 0.01');
                                        return;
                                      }
                                      if (value > 1000) {
                                        alert('Depth cannot exceed 1,000');
                                        return;
                                      }
                                      handleItemChange(index, 'depth', value);
                                    }}
                                    required
                                  />
                                ) : '-'}
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-center text-[#7F5539] text-sm sm:text-base">
                                {item.unit === 'Sft' ? (
                                  (item.description?.toLowerCase().includes('ms') || item.description?.toLowerCase().includes('ss')) 
                                    ? (item.width * item.height * (item.depth || 1)).toFixed(2)
                                    : (item.width * item.height).toFixed(2)
                                ) : '-'}
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2">
                                <input
                                  type="number"
                                  min="0.01"
                                  max="1000000"
                                  step="0.01"
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                  value={item.pricePerUnit || ''}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value < 0.01) {
                                      alert('Price per unit must be at least ₹0.01');
                                      return;
                                    }
                                    if (value > 1000000) {
                                      alert('Price per unit cannot exceed ₹10,00,000');
                                      return;
                                    }
                                    handleItemChange(index, 'pricePerUnit', value);
                                  }}
                                  required
                                />
                              </td>
                              <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-right text-[#7F5539] font-medium text-sm sm:text-base">
                                ₹ {item.total.toLocaleString('en-IN')}
                              </td>
                                                          <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-right text-[#7F5539] font-medium text-sm sm:text-base">
                              ₹ {calculateItemDiscount(item).toLocaleString('en-IN')}
                            </td>
                            <td className="border border-[#B08968]/20 p-1.5 sm:p-2 text-right text-[#7F5539] font-medium text-sm sm:text-base">
                              ₹ {(item.total - calculateItemDiscount(item)).toLocaleString('en-IN')}
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
                            {/* Add Item Button Row */}
                            <tr className="bg-[#B08968]/5">
                              <td colSpan="13" className="border border-[#B08968]/20 p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...formData.items];
                                    newItems.splice(index + 1, 0, {
                                      particular: '',
                                      description: generateDescription('HDHMR', '18mm', 'Hafele', 'carpenter'),
                                      unit: 'Sft',
                                      quantity: 1,
                                      width: 0,
                                      height: 0,
                                      sft: 0,
                                      pricePerUnit: 1250,
                                      total: 0,
                                      depth: 1
                                    });
                                    setFormData({ ...formData, items: newItems });
                                  }}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#B08968] text-white text-sm rounded-lg hover:bg-[#9C6644] transition-colors duration-300 mx-auto"
                                >
                                  <Plus size={16} />
                                  <span>Add Item Below</span>
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

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
                            setDiscountValue(0); // Reset value when changing type
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
                          step={discountType === 'percentage' ? "0.01" : "0.01"}
                          value={discountValue}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            
                            // Validation for discount values
                            if (value < 0) {
                              alert('Discount cannot be negative');
                              return;
                            }
                            
                            if (discountType === 'percentage') {
                              if (value > 100) {
                                alert('Percentage discount cannot exceed 100%');
                                return;
                              }
                            } else {
                              if (value > grandTotal) {
                                alert('Fixed amount discount cannot exceed the total amount');
                                return;
                              }
                            }
                            
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
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[#7F5539]">Discount</h2>
                <div className="flex gap-4">
                  <select
                    className="w-32 px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="amount">Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? "100" : grandTotal}
                    step="0.01"
                    className="flex-1 px-3 py-2 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                    value={discountValue}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      
                      // Validation for discount values
                      if (value < 0) {
                        alert('Discount cannot be negative');
                        return;
                      }
                      
                      if (discountType === 'percentage') {
                        if (value > 100) {
                          alert('Percentage discount cannot exceed 100%');
                          return;
                        }
                      } else {
                        if (value > grandTotal) {
                          alert('Fixed amount discount cannot exceed the total amount');
                          return;
                        }
                      }
                      
                      setDiscountValue(value);
                    }}
                  />
                </div>
              </div>

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
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 border border-[#B08968]/20 rounded text-sm sm:text-base text-[#7F5539] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                  value={term.percentage}
                                  onChange={(e) => {
                                    const percentage = parseFloat(e.target.value) || 0;
                                    
                                    // Validation for percentage
                                    if (percentage < 0) {
                                      alert('Percentage cannot be negative');
                                      return;
                                    }
                                    if (percentage > 100) {
                                      alert('Percentage cannot exceed 100%');
                                      return;
                                    }
                                    
                                    const newTerms = [...formData.paymentTerms];
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

              <button
                type="submit"
                className="w-full p-3 sm:p-4 bg-[#B08968] text-white text-sm sm:text-base rounded-lg font-medium hover:bg-[#9C6644] transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                <span>Generate {documentType}</span>
              </button>
            </form>

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
        </motion.div>
      </motion.div>
    </>
  );
};

export default React.memo(CreateBill);