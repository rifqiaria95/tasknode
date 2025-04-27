const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/BlacklistToken');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  console.log('Token yang diterima:', token);

  try {
    // Cek apakah token sudah ada di blacklist
    const blacklisted = await BlacklistToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: 'Token sudah logout, akses ditolak' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};