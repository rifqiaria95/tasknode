const mongoose = require('mongoose');

const activeTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1d' // Auto hapus setelah 1 hari
  }
});

const ActiveToken = mongoose.model('ActiveToken', activeTokenSchema);

module.exports = ActiveToken;