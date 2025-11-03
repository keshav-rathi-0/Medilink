const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Analgesic',
      'Antibiotic',
      'Anti-inflammatory',
      'Antidiabetic',
      'Antihypertensive',
      'Antihistamine',
      'Cardiovascular',
      'Gastrointestinal',
      'Respiratory',
      'Neurological',
      'Dermatological',
      'Other'
    ]
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Other'],
    default: 'Tablet'
  },
  strength: {
    type: String,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: 0,
    default: 50
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  batchNumber: {
    type: String,
    trim: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  storageConditions: {
    type: String,
    trim: true
  },
  sideEffects: [String],
  contraindications: [String],
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique medicine ID before saving
medicineSchema.pre('save', async function(next) {
  if (this.isNew && !this.medicineId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.medicineId = `MED${timestamp}${random}`;
    
    // Check for uniqueness
    const exists = await this.constructor.findOne({ medicineId: this.medicineId });
    if (exists) {
      const newRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.medicineId = `MED${timestamp}${newRandom}`;
    }
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for stock status
medicineSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.reorderLevel * 0.3) return 'Critical';
  if (this.stockQuantity <= this.reorderLevel) return 'Low Stock';
  return 'In Stock';
});

// Virtual for expiry status
medicineSchema.virtual('expiryStatus').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  if (diffDays <= 90) return 'Expiring in 3 Months';
  return 'Valid';
});

// Ensure virtuals are included in JSON
medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
medicineSchema.index({ medicineId: 1 });
medicineSchema.index({ name: 1 });
medicineSchema.index({ genericName: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ stockQuantity: 1 });
medicineSchema.index({ isActive: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);