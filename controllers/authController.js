const bcrypt                    = require('bcryptjs');
const jwt                       = require('jsonwebtoken');
const crypto                    = require('crypto');
const User                      = require('../models/UserModel');
const BlacklistToken            = require('../models/BlacklistToken');
const ActiveToken               = require('../models/ActiveToken');
const AppError                  = require('../utils/AppError');
const { sendVerificationEmail } = require('../services/emailService');

// @desc    Register new user
// @route   POST /auth/register
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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Simpan token dan expire date di user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; 
    await user.save();

    // Kirim email verifikasi
    await sendVerificationEmail(user.email, verificationToken);

    // Jangan kirim password dalam response
    user.password = undefined;

    // Generate token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verifikasi email
// @route   GET /auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token tidak valid atau sudah kedaluwarsa', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email berhasil diverifikasi. Silakan login.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Silakan masukkan email dan password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Email atau password salah', 401));
    }

    if (!user.isEmailVerified) {
      return next(new AppError('Silakan verifikasi email terlebih dahulu', 403));
    }

    if (!user.active) {
      return next(new AppError('Akun Anda tidak aktif. Hubungi admin.', 403));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    await ActiveToken.create({ token, userId: user._id });
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
// @route   POST /auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new AppError('Token tidak ditemukan', 400));
    }

    await BlacklistToken.create({ token, userId: req.user.id });
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
// @route   GET /auth/active-users
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
// @route   GET /auth/me
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
