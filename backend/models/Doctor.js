const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  availability: [{
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
    },
    slots: [{
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  onCallShifts: [{
    date: Date,
    startTime: String,
    endTime: String
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
