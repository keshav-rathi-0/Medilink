const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  employeeId: { type: String, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  qualification: String,
  joiningDate: { type: Date, required: true },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
    default: 'Full-Time'
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Rotational'],
    default: 'Morning'
  },
  workSchedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  salary: {
    basic: Number,
    allowances: Number,
    total: Number
  },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills: [String],
  certifications: [{
    name: String,
    issueDate: Date,
    expiryDate: Date
  }],
  performance: {
    rating: { type: Number, min: 0, max: 5 },
    lastReviewDate: Date
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);