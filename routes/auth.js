const express        = require('express');
const authController = require('../controllers/authController');
const router         = express.Router();

require('dotenv').config();


// Endpoint
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/active-users', authController.getActiveUserCount);

module.exports = router;
