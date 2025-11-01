const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
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
  appointmentDate: { type: Date, required: true },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  type: { 
    type: String, 
    enum: ['Consultation', 'Follow-up', 'Emergency', 'Surgery'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  },
  symptoms: String,
  diagnosis: String,
  prescription: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Prescription' 
  },
  notes: String,
  operationTheatre: {
    theatreNumber: String,
    equipment: [String]
  },
  cancelReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);