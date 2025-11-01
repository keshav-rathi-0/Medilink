const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  billDate: { type: Date, default: Date.now },
  items: [{
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Consultation', 'Medicine', 'Lab Test', 'Imaging', 'Surgery', 'Room Charges', 'Other']
    },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially-Paid', 'Paid', 'Refunded'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance', 'Cheque']
  },
  insuranceClaim: {
    claimNumber: String,
    provider: String,
    amountClaimed: Number,
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected', 'Partially-Approved'] 
    }
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

billingSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Billing').countDocuments();
    const year = new Date().getFullYear();
    this.billNumber = `BILL-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
