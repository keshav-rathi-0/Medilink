const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const register = async (req, res) => {
  const { name, email, password, role, phone, address, dateOfBirth, gender } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name, email, password, role, phone, address, dateOfBirth, gender
  });

  const token = user.generateToken();
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const  login =   async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ message: 'Account is deactivated' });
  }

  const token = user.generateToken();
  
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const  forgotPassword =   async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  const message = `Reset your password using this link: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return res.status(500).json({ message: 'Email could not be sent' });
  }
};

const  resetPassword =   async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.generateToken();
  
  res.status(200).json({ success: true, token });
};

const  getMe =   async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

const  updatePassword =   async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = user.generateToken();
  res.status(200).json({ success: true, token });
};


module.exports = {
  updatePassword,
  getMe,
  resetPassword,
  forgotPassword,
  login,
  register
}