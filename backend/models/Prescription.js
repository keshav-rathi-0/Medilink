const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  medicines: [{
    medicine: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Medicine', 
      required: true 
    },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: String,
    quantity: { type: Number, required: true }
  }],
  diagnosis: String,
  symptoms: String,
  labTests: [String],
  status: {
    type: String,
    enum: ['Pending', 'Partially-Filled', 'Fulfilled', 'Cancelled'],
    default: 'Pending'
  },
  refillsAllowed: { type: Number, default: 0 },
  refillsUsed: { type: Number, default: 0 },
  validUntil: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);