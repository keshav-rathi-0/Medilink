const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  patientId: { type: String, unique: true, required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['Active', 'Resolved', 'Chronic'] },
    notes: String
  }],
  allergies: [String],
  currentMedications: [{
    medicine: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  labReports: [{
    testName: String,
    date: Date,
    results: String,
    fileUrl: String
  }],
  imagingData: [{
    type: String,
    date: Date,
    findings: String,
    fileUrl: String
  }],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    validUntil: Date
  },
  admissionHistory: [{
    admissionDate: Date,
    dischargeDate: Date,
    reason: String,
    ward: String
  }],
  createdAt: { type: Date, default: Date.now }
});

patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
