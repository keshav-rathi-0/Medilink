const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');

exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, appointmentDate, timeSlot, type, symptoms, priority } = req.body;

  const patientExists = await Patient.findById(patient);
  const doctorExists = await Doctor.findById(doctor);

  if (!patientExists || !doctorExists) {
    return res.status(404).json({ message: 'Patient or Doctor not found' });
  }

  // Check if slot is available
  const existingAppointment = await Appointment.findOne({
    doctor,
    appointmentDate,
    'timeSlot.startTime': timeSlot.startTime,
    status: { $nin: ['Cancelled', 'Completed'] }
  });

  if (existingAppointment) {
    return res.status(400).json({ message: 'Time slot not available' });
  }

  const appointment = await Appointment.create({
    patient, doctor, appointmentDate, timeSlot, type, symptoms, priority,
    createdBy: req.user.id
  });

  res.status(201).json({ success: true, data: appointment });
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const { doctor, patient, status, date, priority } = req.query;
  
  let query = {};
  if (doctor) query.doctor = doctor;
  if (patient) query.patient = patient;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (date) {
    query.appointmentDate = {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
    };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'patientId userId')
    .populate('doctor', 'userId specialization')
    .populate('patient.userId', 'name phone')
    .populate('doctor.userId', 'name')
    .sort('-appointmentDate');

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor')
    .populate('prescription');
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  res.status(200).json({ success: true, data: appointment });
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: appointment });
});

exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.status = 'Cancelled';
  appointment.cancelReason = req.body.reason;
  await appointment.save();

  res.status(200).json({ success: true, data: appointment });
});

exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { appointmentDate, timeSlot } = req.body;
  
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Check availability
  const conflict = await Appointment.findOne({
    doctor: appointment.doctor,
    appointmentDate,
    'timeSlot.startTime': timeSlot.startTime,
    _id: { $ne: req.params.id },
    status: { $nin: ['Cancelled', 'Completed'] }
  });

  if (conflict) {
    return res.status(400).json({ message: 'Time slot not available' });
  }

  appointment.appointmentDate = appointmentDate;
  appointment.timeSlot = timeSlot;
  await appointment.save();

  res.status(200).json({ success: true, data: appointment });
});
