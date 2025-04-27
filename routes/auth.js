const express = require('express');
const authController = require('../controllers/authController');
require('dotenv').config();

const router = express.Router();

// Endpoint
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/active-users', authController.getActiveUserCount);

module.exports = router;
