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
  