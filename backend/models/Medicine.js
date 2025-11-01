const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: String,
  manufacturer: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drop', 'Inhaler'],
    required: true 
  },
  dosageForm: String,
  strength: String,
  stockQuantity: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, required: true, default: 50 },
  unitPrice: { type: Number, required: true },
  batchNumber: String,
  manufactureDate: Date,
  expiryDate: { type: Date, required: true },
  supplierInfo: {
    name: String,
    contact: String,
    email: String
  },
  storageConditions: String,
  prescriptionRequired: { type: Boolean, default: true },
  sideEffects: [String],
  contraindications: [String],
  isActive: { type: Boolean, default: true },
  lastRestocked: Date,
  createdAt: { type: Date, default: Date.now }
});

medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ stockQuantity: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);