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

  const staff = await Staff.create({
    userId, designation, department, qualification, joiningDate,
    employmentType, shift, salary
  });

  res.status(201).json({ success: true, data: staff });
});

exports.getStaff = asyncHandler(async (req, res) => {
  const { department, designation, employmentType } = req.query;
  
  let query = { isActive: true };
  if (department) query.department = department;
  if (designation) query.designation = designation;
  if (employmentType) query.employmentType = employmentType;

  const staff = await Staff.find(query)
    .populate('userId', 'name email phone role')
    .populate('supervisor', 'name');

  res.status(200).json({ success: true, count: staff.length, data: staff });
});

exports.getStaffMember = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id)
    .populate('userId')
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

  staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: staff });
});

exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  staff.isActive = false;
  await staff.save();

  res.status(200).json({ success: true, message: 'Staff member deactivated' });
});

exports.updatePerformance = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  
  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  staff.performance = {
    rating,
    lastReviewDate: new Date()
  };

  await staff.save();

  res.status(200).json({ success: true, data: staff });
});
