const AppError = require('../utils/AppError');
const { ForbiddenError } = require('@casl/ability');

module.exports = (err, req, res, next) => {
  // Log error untuk development
  console.error('ERROR:', err);

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    statusCode: err.statusCode || 500
  };

  // Handle khusus untuk AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle khusus untuk CASL ForbiddenError
  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      success: false,
      message: 'Anda tidak memiliki izin untuk melakukan aksi ini',
      requiredPermissions: {
        action: err.action,
        subject: err.subjectType
      }
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: messages
    });
  }

  // Handle Mongoose duplicate field errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} sudah digunakan, silakan gunakan ${field} lain`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah kadaluarsa, silakan login kembali'
    });
  }

  // Response error untuk production
  if (process.env.NODE_ENV === 'production') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  // Response error untuk development (termasuk stack trace)
  res.status(error.statusCode).json({
    ...error,
    stack: err.stack,
    error: err
  });
};