const User     = require('../models/UserModel');
const AppError = require('../utils/AppError');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new AppError('User tidak ditemukan', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (register)
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, active } = req.body;
    
    // Default role adalah user kecuali jika admin yang membuat
    const userRole = req.user && req.user.role === 'admin' ? role || 'user' : 'user';
    
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      active,
    });
    
    // Jangan kirim password dalam response
    user.password = undefined;
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User tidak ditemukan', 404));
    }
    
    const { name, email, address, phone, active } = req.body;
    
    user.name      = name || user.name;
    user.email     = email || user.email;
    user.address   = address || user.address;
    user.phone     = phone || user.phone;
    user.active    = active !== undefined ? active : user.active;
    user.updatedAt = Date.now();
    
    await user.save();
    
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User tidak ditemukan', 404));
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};