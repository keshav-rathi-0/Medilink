const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const logger = require('../utils/logger'); // ensure logger exists

const register = async (req, res, next) => {
  try {
    // Extract ALL fields from request body
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      dateOfBirth, 
      gender, 
      address 
    } = req.body;

    console.log('📥 Registration request:', { name, email, role, phone, dateOfBirth, gender, address }); // Debug log

    // Basic server-side validation
    if (!name || !email || !password || !phone) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: name, email, password, and phone are required'
      });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('❌ Email already registered:', email);
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Create user with ALL fields
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Patient', // Default to Patient if not provided
      phone
    };

    // Add optional fields if provided
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
    if (gender) userData.gender = gender;
    if (address) userData.address = address;

    console.log('📝 Creating user with data:', { ...userData, password: '[HIDDEN]' });

    const user = await User.create(userData);
    console.log('✅ User created successfully:', user._id);

    // Generate token for immediate login (optional)
    const token = user.generateToken();

    // Remove sensitive fields for response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      isActive: user.isActive
    };

    console.log('✅ Sending success response');

    return res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token // Include token if you want auto-login after registration
    });
  } catch (err) {
    // Log full error for debugging
    console.error('❌ Registration error:', err);
    
    // Check for specific mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors 
      });
    }

    // Check for duplicate key error
    if (err.code === 11000) {
      console.log('❌ Duplicate key error:', err.keyPattern);
      return res.status(409).json({ 
        success: false,
        message: 'Email or phone already registered' 
      });
    }

    // Return generic 500 for other errors
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      console.log('❌ Account deactivated:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    const token = user.generateToken();
    console.log('✅ Login successful:', email);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No user found with that email' 
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Updated reset URL to match frontend route
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please use this link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - MediCare HMS',
        message
      });

      res.status(200).json({ 
        success: true, 
        message: 'Password reset email sent' 
      });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('❌ Email error:', emailErr);
      return res.status(500).json({ 
        success: false,
        message: 'Email could not be sent. Please try again later.' 
      });
    }
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.generateToken();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful',
      token 
    });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address
      }
    });
  } catch (err) {
    console.error('❌ Verify token error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (err) {
    console.error('❌ Get me error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.generateToken();
    
    res.status(200).json({ 
      success: true,
      message: 'Password updated successfully',
      token 
    });
  } catch (err) {
    console.error('❌ Update password error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
  getMe,
  updatePassword
};