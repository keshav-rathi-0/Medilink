const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new bill
// @route   POST /api/billing
// @access  Private (Admin, Receptionist)
exports.createBill = asyncHandler(async (req, res) => {
  const { patient, items, discount, tax, notes, paymentMethod } = req.body;

  // Validate patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Calculate amounts
  const subtotal = items.reduce((sum, item) => {
    const itemAmount = item.quantity * item.unitPrice;
    return sum + itemAmount;
  }, 0);

  const discountAmount = discount || 0;
  const taxAmount = tax || 0;
  const totalAmount = subtotal - discountAmount + taxAmount;
  const balance = totalAmount;

  // Create items with calculated amounts
  const billItems = items.map(item => ({
    ...item,
    amount: item.quantity * item.unitPrice
  }));

  const bill = await Billing.create({
    patient,
    items: billItems,
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    totalAmount,
    balance,
    paymentMethod: paymentMethod || undefined,
    notes,
    generatedBy: req.user.id
  });

  await bill.populate([
    {
      path: 'patient',
      populate: {
        path: 'userId',
        select: 'name email phone address dateOfBirth gender'
      }
    },
    { path: 'generatedBy', select: 'name role' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Bill created successfully',
    data: bill
  });
});

// @desc    Get all bills with filters
// @route   GET /api/billing
// @access  Private (Admin, Receptionist)
exports.getBills = asyncHandler(async (req, res) => {
  const { patient, paymentStatus, startDate, endDate, search, page = 1, limit = 10 } = req.query;
  
  let query = {};
  
  if (patient) {
    query.patient = patient;
  }
  
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }
  
  if (startDate && endDate) {
    query.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Search by bill number
  if (search) {
    query.$or = [
      { billNumber: new RegExp(search, 'i') }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bills = await Billing.find(query)
    .populate({
      path: 'patient',
      populate: {
        path: 'userId',
        select: 'name email phone dateOfBirth gender'
      }
    })
    .populate('generatedBy', 'name role')
    .sort('-billDate')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Billing.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bills.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: bills
  });
});

// @desc    Get single bill
// @route   GET /api/billing/:id
// @access  Private
exports.getBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'userId', select: 'name email phone address' }
    })
    .populate('generatedBy', 'name role');
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  res.status(200).json({
    success: true,
    data: bill
  });
});

// @desc    Record payment
// @route   POST /api/billing/:id/payment
// @access  Private (Admin, Receptionist)
exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, transactionId, notes } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid payment amount is required'
    });
  }

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Payment method is required'
    });
  }

  const bill = await Billing.findById(req.params.id);
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  // Check if payment amount exceeds balance
  if (amount > bill.balance) {
    return res.status(400).json({
      success: false,
      message: `Payment amount (${amount}) exceeds balance (${bill.balance})`
    });
  }

  bill.amountPaid += parseFloat(amount);
  bill.balance = bill.totalAmount - bill.amountPaid;
  bill.paymentMethod = paymentMethod;

  // Add payment record
  if (!bill.payments) {
    bill.payments = [];
  }
  
  bill.payments.push({
    amount: parseFloat(amount),
    paymentMethod,
    transactionId,
    notes,
    paymentDate: new Date()
  });

  // Update payment status
  if (bill.balance === 0) {
    bill.paymentStatus = 'Paid';
  } else if (bill.amountPaid > 0) {
    bill.paymentStatus = 'Partially-Paid';
  }

  await bill.save();

  await bill.populate([
    { path: 'patient', populate: { path: 'userId', select: 'name email phone' } },
    { path: 'generatedBy', select: 'name role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Payment recorded successfully',
    data: bill
  });
});

// @desc    Process insurance claim
// @route   POST /api/billing/:id/insurance
// @access  Private (Admin, Receptionist)
exports.processInsuranceClaim = asyncHandler(async (req, res) => {
  const { claimNumber, provider, amountClaimed } = req.body;
  
  if (!claimNumber || !provider || !amountClaimed) {
    return res.status(400).json({
      success: false,
      message: 'Claim number, provider, and amount claimed are required'
    });
  }

  const bill = await Billing.findById(req.params.id);
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  bill.insuranceClaim = {
    claimNumber,
    provider,
    amountClaimed: parseFloat(amountClaimed),
    status: 'Pending',
    submittedDate: new Date()
  };

  await bill.save();

  await bill.populate([
    { path: 'patient', populate: { path: 'userId', select: 'name email phone' } },
    { path: 'generatedBy', select: 'name role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Insurance claim submitted successfully',
    data: bill
  });
});

// @desc    Update insurance claim status
// @route   PUT /api/billing/:id/insurance
// @access  Private (Admin)
exports.updateInsuranceClaim = asyncHandler(async (req, res) => {
  const { status, approvedAmount, rejectionReason } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  const bill = await Billing.findById(req.params.id);
  
  if (!bill || !bill.insuranceClaim) {
    return res.status(404).json({
      success: false,
      message: 'Bill or insurance claim not found'
    });
  }

  bill.insuranceClaim.status = status;
  bill.insuranceClaim.processedDate = new Date();
  
  if (status === 'Approved' || status === 'Partially-Approved') {
    const amount = approvedAmount || bill.insuranceClaim.amountClaimed;
    bill.insuranceClaim.approvedAmount = amount;
    
    // Record as payment
    bill.amountPaid += parseFloat(amount);
    bill.balance = bill.totalAmount - bill.amountPaid;
    
    if (!bill.payments) {
      bill.payments = [];
    }
    
    bill.payments.push({
      amount: parseFloat(amount),
      paymentMethod: 'Insurance',
      notes: `Insurance claim approved - ${bill.insuranceClaim.claimNumber}`,
      paymentDate: new Date()
    });
    
    if (bill.balance === 0) {
      bill.paymentStatus = 'Paid';
    } else if (bill.amountPaid > 0) {
      bill.paymentStatus = 'Partially-Paid';
    }
  } else if (status === 'Rejected') {
    bill.insuranceClaim.rejectionReason = rejectionReason;
  }

  await bill.save();

  await bill.populate([
    { path: 'patient', populate: { path: 'userId', select: 'name email phone' } },
    { path: 'generatedBy', select: 'name role' }
  ]);

  res.status(200).json({
    success: true,
    message: `Insurance claim ${status.toLowerCase()} successfully`,
    data: bill
  });
});

// @desc    Get billing statistics
// @route   GET /api/billing/stats
// @access  Private (Admin, Receptionist)
exports.getBillingStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateQuery = {};
  if (startDate && endDate) {
    dateQuery.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const totalBills = await Billing.countDocuments(dateQuery);
  
  const totalRevenue = await Billing.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const totalCollected = await Billing.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } }
  ]);

  const totalPending = await Billing.aggregate([
    { $match: dateQuery },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  const paymentStatusBreakdown = await Billing.aggregate([
    { $match: dateQuery },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
  ]);

  const paymentMethodBreakdown = await Billing.aggregate([
    { $match: { ...dateQuery, paymentMethod: { $ne: null } } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amountPaid' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalBills,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCollected: totalCollected[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
      paymentStatusBreakdown,
      paymentMethodBreakdown
    }
  });
});

// @desc    Delete bill
// @route   DELETE /api/billing/:id
// @access  Private (Admin)
exports.deleteBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  // Don't allow deletion if payment has been made
  if (bill.amountPaid > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete bill with recorded payments'
    });
  }

  await bill.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Bill deleted successfully'
  });
});