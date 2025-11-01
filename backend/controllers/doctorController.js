const Doctor = require('../models/Doctor');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.createDoctor = asyncHandler(async (req, res) => {
  const { userId, specialization, qualification, experience, licenseNumber, 
          department, consultationFee, availability } = req.body;

  const user = await User.findById(userId);
  if (!user || user.role !== 'Doctor') {
    return res.status(400).json({ message: 'Invalid user or not a doctor' });
  }

  const doctor = await Doctor.create({
    userId, specialization, qualification, experience, licenseNumber,
    department, consultationFee, availability
  });

  res.status(201).json({ success: true, data: doctor });
});

exports.getDoctors = asyncHandler(async (req, res) => {
  const { specialization, department, isAvailable } = req.query;
  
  let query = {};
  if (specialization) query.specialization = specialization;
  if (department) query.department = department;
  if (isAvailable) query.isAvailable = isAvailable === 'true';

  const doctors = await Doctor.find(query).populate('userId', 'name email phone');
  
  res.status(200).json({ success: true, count: doctors.length, data: doctors });
});

exports.getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone address');
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.status(200).json({ success: true, data: doctor });
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: doctor });
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  await doctor.deleteOne();
  res.status(200).json({ success: true, message: 'Doctor deleted' });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { availability: req.body.availability },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.status(200).json({ success: true, data: doctor });
});

exports.addOnCallShift = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  doctor.onCallShifts.push(req.body.shift);
  await doctor.save();

  res.status(200).json({ success: true, data: doctor });
});
