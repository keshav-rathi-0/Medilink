const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const logger = require('../utils/logger'); // ensure logger exists

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body

    // basic server-side guard (more validation may exist elsewhere)
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ errors: [{ msg: 'Missing required fields', path: 'body' }] })
    }

    // check duplicate
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // create user (adjust fields to match your User model)
    const user = new User({ name, email, password, role, phone })
    await user.save()

    // remove sensitive fields for response
    const userSafe = { id: user._id, name: user.name, email: user.email, role: user.role }

    return res.status(201).json({ message: 'User registered', user: userSafe })
  } catch (err) {
    // log full error for Render logs (do NOT leak stack to clients)
    logger?.error ? logger.error('Register error', err) : console.error('Register error', err)
    // return generic 500 so client sees failure but logs contain details
    return res.status(500).json({ message: 'Internal server error' })
  }
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