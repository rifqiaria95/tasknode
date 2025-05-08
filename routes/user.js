const express               = require('express');
const router                = express.Router();
const userController        = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const authorize             = require('../middlewares/authorize');

// Public routes
router.post('/', userController.createUser);

// Protected routes
router.use(authenticateToken);

router.get('/', authorize('read', 'User'), userController.getAllUsers);
router.get('/:id', authorize('read', 'User'), userController.getUser);
router.put('/:id', authorize('update', 'User'), userController.updateUser);
router.delete('/:id', authorize('delete', 'User'), userController.deleteUser);

module.exports = router;