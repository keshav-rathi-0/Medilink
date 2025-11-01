const Billing = require('../models/Billing');
const asyncHandler = require('../utils/asyncHandler');

exports.createBill = asyncHandler(async (req, res) => {
  const { patient, items, discount, tax } = req.body;

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = subtotal - (discount || 0) + (tax || 0);
  const balance = totalAmount;

  const bill = await Billing.create({
    patient, items, subtotal, discount, tax, totalAmount, balance,
    generatedBy: req.user.id
  });

  res.status(201).json({ success: true, data: bill });
});

exports.getBills = asyncHandler(async (req, res) => {
  const { patient, paymentStatus, startDate, endDate } = req.query;
  
  let query = {};
  if (patient) query.patient = patient;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (startDate && endDate) {
    query.billDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const bills = await Billing.find(query)
    .populate('patient', 'patientId userId')
    .sort('-billDate');

  res.status(200).json({ success: true, count: bills.length, data: bills });
});

exports.getBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate('patient')
    .populate('generatedBy', 'name role');
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  res.status(200).json({ success: true, data: bill });
});

exports.recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body;
  
  const bill = await Billing.findById(req.params.id);
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  bill.amountPaid += amount;
  bill.balance = bill.totalAmount - bill.amountPaid;
  bill.paymentMethod = paymentMethod;

  if (bill.balance === 0) {
    bill.paymentStatus = 'Paid';
  } else if (bill.amountPaid > 0) {
    bill.paymentStatus = 'Partially-Paid';
  }

  await bill.save();

  res.status(200).json({ success: true, data: bill });
});

exports.processInsuranceClaim = asyncHandler(async (req, res) => {
  const { claimNumber, provider, amountClaimed } = req.body;
  
  const bill = await Billing.findById(req.params.id);
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  bill.insuranceClaim = {
    claimNumber,
    provider,
    amountClaimed,
    status: 'Pending'
  };

  await bill.save();

  res.status(200).json({ success: true, data: bill });
});

exports.updateInsuranceClaim = asyncHandler(async (req, res) => {
  const { status, approvedAmount } = req.body;
  
  const bill = await Billing.findById(req.params.id);
  
  if (!bill || !bill.insuranceClaim) {
    return res.status(404).json({ message: 'Bill or insurance claim not found' });
  }

  bill.insuranceClaim.status = status;
  
  if (status === 'Approved' || status === 'Partially-Approved') {
    const amount = approvedAmount || bill.insuranceClaim.amountClaimed;
    bill.amountPaid += amount;
    bill.balance = bill.totalAmount - bill.amountPaid;
    
    if (bill.balance === 0) {
      bill.paymentStatus = 'Paid';
    } else {
      bill.paymentStatus = 'Partially-Paid';
    }
  }

  await bill.save();

  res.status(200).json({ success: true, data: bill });
});
