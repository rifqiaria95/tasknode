const jwt                = require('jsonwebtoken');
const BlacklistToken     = require('../models/BlacklistToken');
const defineAbilitiesFor = require('../abilities/defineAbilities');
const AppError           = require('../utils/AppError');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Token tidak ditemukan', 401));
  }

  try {
    // Cek apakah token sudah ada di blacklist
    const blacklisted = await BlacklistToken.findOne({ token });
    if (blacklisted) {
      return next(new AppError('Token sudah logout, akses ditolak', 401));
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ke request
    req.user = decoded;
    
    // Set abilities untuk user yang sedang login
    req.ability = defineAbilitiesFor(req.user);
    
    next();
  } catch (err) {
    return next(new AppError('Token tidak valid atau sudah kadaluarsa', 403));
  }
};