const express               = require('express');
const router                = express.Router();
const todoController        = require('../controllers/todoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Bikin Route CRUD
router.post('/', authenticateToken, todoController.createTodo);
router.get('/', authenticateToken, todoController.getAllTodos);
router.get('/:id', authenticateToken, todoController.getTodoById);
router.put('/:id', authenticateToken, todoController.updateTodo);
router.delete('/:id', authenticateToken, todoController.deleteTodo);

router.patch('/:id/toggle', authenticateToken, todoController.toggleComplete);

module.exports = router;
