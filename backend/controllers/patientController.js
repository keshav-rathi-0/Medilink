const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.createPatient = asyncHandler(async (req, res) => {
  const { userId, bloodGroup, emergencyContact, allergies, insuranceInfo } = req.body;

  const user = await User.findById(userId);
  if (!user || user.role !== 'Patient') {
    return res.status(400).json({ message: 'Invalid user or not a patient' });
  }

  const patient = await Patient.create({
    userId, bloodGroup, emergencyContact, allergies, insuranceInfo
  });

  res.status(201).json({ success: true, data: patient });
});

exports.getPatients = asyncHandler(async (req, res) => {
  const { search, bloodGroup } = req.query;
  
  let query = {};
  if (bloodGroup) query.bloodGroup = bloodGroup;
  
  if (search) {
    query.$or = [
      { patientId: new RegExp(search, 'i') }
    ];
  }

  const patients = await Patient.find(query).populate('userId', 'name email phone address');
  
  res.status(200).json({ success: true, count: patients.length, data: patients });
});

exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('userId', 'name email phone address dateOfBirth gender');
  
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  res.status(200).json({ success: true, data: patient });
});

exports.updatePatient = asyncHandler(async (req, res) => {
  let patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: patient });
});

exports.deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  await patient.deleteOne();
  res.status(200).json({ success: true, message: 'Patient deleted' });
});

exports.addMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  patient.medicalHistory.push(req.body);
  await patient.save();

  res.status(200).json({ success: true, data: patient });
});

exports.addLabReport = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  patient.labReports.push(req.body);
  await patient.save();

  res.status(200).json({ success: true, data: patient });
});

