const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const User           = require('../models/UserModel');
const BlacklistToken = require('../models/BlacklistToken');
const ActiveToken    = require('../models/ActiveToken');
const AppError       = require('../utils/AppError');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi email unik
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email sudah terdaftar', 400));
    }

    // Buat user baru
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Default role user
    });

    // Jangan kirim password dalam response
    user.password = undefined;

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Simpan token aktif
    await ActiveToken.create({ token, userId: user._id });

    res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Cek jika email dan password ada
    if (!email || !password) {
      return next(new AppError('Silakan masukkan email dan password', 400));
    }

    // 2) Cek jika user ada dan password benar
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Email atau password salah', 401));
    }

    // 3) Cek apakah user aktif
    if (!user.active) {
      throw new AppError('Akun Anda tidak aktif. Hubungi admin.', 403);
    }

    // 4) Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // 5) Simpan token aktif
    await ActiveToken.create({ token, userId: user._id });

    // 6) Kirim response
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new AppError('Token tidak ditemukan', 400));
    }

    // Tambahkan token ke blacklist
    await BlacklistToken.create({ token, userId: req.user.id });
    
    // Hapus dari active tokens
    await ActiveToken.deleteOne({ token });

    res.status(200).json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jumlah user aktif
// @route   GET /api/auth/active-users
// @access  Private/Admin
exports.getActiveUserCount = async (req, res, next) => {
  try {
    const count = await ActiveToken.countDocuments();
    res.status(200).json({
      success: true,
      activeUsers: count
    });
  } catch (error) {
    next(new AppError('Gagal menghitung user aktif', 500));
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};