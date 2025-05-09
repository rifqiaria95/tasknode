const fs         = require('fs');
const path       = require('path');
const nodemailer = require('nodemailer');

// Buat transporter Mailtrap
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS 
  }
});

// Fungsi kirim email verifikasi
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `http://localhost:3001/auth/verify-email/${verificationToken}`;

  // Ambil isi file HTML dari public/verify-email.html
  const filePath     = path.join(__dirname, '..', 'public', 'verify-email.html');
  let   htmlTemplate = fs.readFileSync(filePath, 'utf-8');

  // Opsional: Ganti placeholder di HTML dengan token/link
  htmlTemplate = htmlTemplate.replace('{{VERIFICATION_URL}}', verificationUrl);

  const mailOptions = {
    from: '"Admin App" <noreply@example.com>',
    to: email,
    subject: 'Verifikasi Email Anda',
    html: htmlTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email verifikasi berhasil dikirim!');
  } catch (err) {
    console.error('Gagal mengirim email:', err);
  }
};

module.exports = { sendVerificationEmail };
