const { ForbiddenError } = require('@casl/ability');
const defineAbilitiesFor = require('../abilities/defineAbilities');
const AppError           = require('../utils/AppError');

// Middleware untuk memeriksa autentikasi dan mengatur abilities
module.exports = (action, subject) => {
  return async (req, res, next) => {
    try {
      // Jika route memerlukan autentikasi tapi tidak ada user
      if (!req.user) {
        throw new AppError('Anda harus login untuk mengakses ini', 401);
      }
      
      // Set abilities untuk user yang sedang login
      req.ability = await defineAbilitiesFor(req.user);
      
      // Jika action dan subject didefinisikan, lakukan pengecekan permission
      if (action && subject) {
        ForbiddenError.from(req.ability).throwUnlessCan(action, subject);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};