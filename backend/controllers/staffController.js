const Staff = require('../models/Staff');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.createStaff = asyncHandler(async (req, res) => {
  const { userId, designation, department, qualification, joiningDate, 
          employmentType, shift, salary } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if staff profile already exists for this user
  const existingStaff = await Staff.findOne({ userId });
  if (existingStaff) {
    return res.status(400).json({ message: 'Staff profile already exists for this user' });
  }

  const staff = await Staff.create({
    userId,
    designation,
    department,
    qualification,
    joiningDate,
    employmentType,
    shift,
    salary: {
      basic: salary.basic || 0,
      allowances: salary.allowances || 0,
      total: (salary.basic || 0) + (salary.allowances || 0)
    }
  });

  const populatedStaff = await Staff.findById(staff._id).populate('userId', 'name email phone');

  res.status(201).json({ success: true, data: populatedStaff });
});

exports.getStaff = asyncHandler(async (req, res) => {
  const { department, designation, employmentType, shift } = req.query;
  
  let query = { isActive: true };
  if (department) query.department = department;
  if (designation) query.designation = designation;
  if (employmentType) query.employmentType = employmentType;
  if (shift) query.shift = shift;

  const staff = await Staff.find(query)
    .populate('userId', 'name email phone role dateOfBirth gender')
    .populate('supervisor', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: staff.length, data: staff });
});

exports.getAvailableStaffUsers = asyncHandler(async (req, res) => {
  const existingStaffUsers = await Staff.find({ isActive: true }).distinct('userId');
  
  const availableUsers = await User.find({
    _id: { $nin: existingStaffUsers },
    $or: [
      { role: { $exists: false } },
      { role: { $in: ['Staff', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician', 'Radiologist'] } },
      { role: { $nin: ['Admin', 'Doctor', 'Patient'] } }
    ]
  }).select('name email phone role');

  res.status(200).json({ success: true, data: availableUsers });
});

exports.getStaffMember = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id)
    .populate('userId', 'name email phone role dateOfBirth gender address')
    .populate('supervisor', 'name email');
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  res.status(200).json({ success: true, data: staff });
});

exports.updateStaff = asyncHandler(async (req, res) => {
  let staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  const { designation, department, qualification, joiningDate, employmentType, shift, salary, skills, supervisor } = req.body;

  const updateData = {
    designation,
    department,
    qualification,
    joiningDate,
    employmentType,
    shift,
    skills,
    supervisor
  };

  if (salary) {
    updateData.salary = {
      basic: salary.basic || staff.salary.basic,
      allowances: salary.allowances || staff.salary.allowances,
      total: (salary.basic || staff.salary.basic) + (salary.allowances || staff.salary.allowances)
    };
  }

  staff = await Staff.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('userId', 'name email phone');

  res.status(200).json({ success: true, data: staff });
});

exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  staff.isActive = false;
  await staff.save();

  res.status(200).json({ success: true, message: 'Staff member deactivated successfully' });
});

exports.updatePerformance = asyncHandler(async (req, res) => {
  const { rating, notes } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  staff.performance = {
    rating,
    lastReviewDate: new Date(),
    notes
  };

  await staff.save();

  res.status(200).json({ success: true, data: staff });
});

exports.getStaffByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;

  const staff = await Staff.find({ department, isActive: true })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: staff.length, data: staff });
});

exports.getStaffStats = asyncHandler(async (req, res) => {
  const totalStaff = await Staff.countDocuments({ isActive: true });
  const byDepartment = await Staff.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  const byShift = await Staff.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$shift', count: { $sum: 1 } } }
  ]);
  const byEmploymentType = await Staff.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$employmentType', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStaff,
      byDepartment,
      byShift,
      byEmploymentType
    }
  });
});