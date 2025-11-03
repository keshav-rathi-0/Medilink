const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true },
  isOccupied: { type: Boolean, default: false },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  admissionDate: Date,
  expectedDischargeDate: Date
});

const wardSchema = new mongoose.Schema({
  wardNumber: { type: String, required: true, unique: true },
  wardName: { type: String, required: true },
  wardType: {
    type: String,
    enum: ['General', 'ICU', 'NICU', 'Private', 'Semi-Private', 'Emergency', 'Isolation'],
    required: true
  },
  department: String,
  floor: Number,
  totalBeds: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  beds: [bedSchema],
  gender: { type: String, enum: ['Male', 'Female', 'Mixed'] },
  facilities: [String],
  dailyRate: { type: Number, required: true },
  nurseInCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ward', wardSchema);