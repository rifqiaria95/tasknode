const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistToken = require('../models/BlacklistToken');
const ActiveToken = require('../models/ActiveToken');

// REGISTER user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username sudah terpakai' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Username tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password salah' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await ActiveToken.create({ token });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT user
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'Token tidak ditemukan' });
    }

    await BlacklistToken.create({ token });
    await ActiveToken.deleteOne({ token });

    res.json({ message: 'Logout berhasil, token diblacklist' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET jumlah user aktif
exports.getActiveUserCount = async (req, res) => {
  try {
    const count = await ActiveToken.countDocuments();
    res.json({ activeUsers: count });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghitung user aktif' });
  }
};
