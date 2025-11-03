const Doctor = require('../models/Doctor');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get users with role "Doctor" who don't have a doctor profile yet
exports.getAvailableDoctorUsers = asyncHandler(async (req, res) => {
  // Get all doctor users
  const doctorUsers = await User.find({ role: 'Doctor' }).select('_id name email phone');
  
  // Get all existing doctor profiles
  const existingDoctors = await Doctor.find().select('userId');
  const existingUserIds = existingDoctors.map(d => d.userId.toString());
  
  // Filter out users who already have doctor profiles
  const availableUsers = doctorUsers.filter(user => !existingUserIds.includes(user._id.toString()));
  
  res.status(200).json({
    success: true,
    count: availableUsers.length,
    data: availableUsers
  });
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const { userId, specialization, qualification, experience, licenseNumber, 
          department, consultationFee, availability } = req.body;

  const user = await User.findById(userId);
  if (!user || user.role !== 'Doctor') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid user or not a doctor' 
    });
  }

  // Check if doctor profile already exists
  const existingDoctor = await Doctor.findOne({ userId });
  if (existingDoctor) {
    return res.status(400).json({ 
      success: false,
      message: 'Doctor profile already exists for this user' 
    });
  }

  const doctor = await Doctor.create({
    userId, 
    specialization, 
    qualification, 
    experience, 
    licenseNumber,
    department, 
    consultationFee, 
    availability: availability || []
  });

  await doctor.populate('userId', 'name email phone');

  res.status(201).json({ 
    success: true,
    message: 'Doctor profile created successfully',
    data: doctor 
  });
});

exports.getDoctors = asyncHandler(async (req, res) => {
  const { specialization, department, isAvailable, search, page = 1, limit = 10 } = req.query;
  
  let query = {};
  
  if (specialization) query.specialization = specialization;
  if (department) query.department = department;
  if (isAvailable) query.isAvailable = isAvailable === 'true';

  // Search functionality
  if (search) {
    const users = await User.find({
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ]
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    query.$or = [
      { licenseNumber: new RegExp(search, 'i') },
      { userId: { $in: userIds } }
    ];
  }

  const skip = (page - 1) * limit;

  const doctors = await Doctor.find(query)
    .populate('userId', 'name email phone address dateOfBirth gender')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ createdAt: -1 });
  
  const total = await Doctor.countDocuments(query);

  res.status(200).json({ 
    success: true, 
    count: doctors.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: doctors 
  });
});

exports.getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email phone address dateOfBirth gender');
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  res.status(200).json({ 
    success: true, 
    data: doctor 
  });
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  // Prevent updating userId
  delete req.body.userId;

  doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('userId', 'name email phone address dateOfBirth gender');

  res.status(200).json({ 
    success: true,
    message: 'Doctor updated successfully',
    data: doctor 
  });
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  await doctor.deleteOne();
  
  res.status(200).json({ 
    success: true, 
    message: 'Doctor deleted successfully' 
  });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { availability: req.body.availability },
    { new: true, runValidators: true }
  ).populate('userId', 'name email phone');

  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  res.status(200).json({ 
    success: true,
    message: 'Availability updated successfully',
    data: doctor 
  });
});

exports.addOnCallShift = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  doctor.onCallShifts.push(req.body);
  await doctor.save();

  res.status(200).json({ 
    success: true,
    message: 'On-call shift added successfully',
    data: doctor 
  });
});

// Get doctor's schedule/availability
exports.getDoctorSchedule = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email')
    .select('availability onCallShifts');
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  res.status(200).json({ 
    success: true, 
    data: doctor 
  });
});

// Get doctor's appointments
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      message: 'Doctor not found' 
    });
  }

  const Appointment = require('../models/Appointment');
  const appointments = await Appointment.find({ doctor: req.params.id })
    .populate('patient', 'patientId')
    .populate('patient.userId', 'name phone')
    .sort({ appointmentDate: -1 });

  res.status(200).json({ 
    success: true, 
    count: appointments.length,
    data: appointments 
  });
});