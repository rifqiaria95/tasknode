const Todo = require('../models/TodoModel');

// CREATE - Tambah Todo
exports.createTodo = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const newTodo = new Todo({ title, description, status });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ - Semua Todo
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ - Todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Task tidak ditemukan' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE - Todo by ID
exports.updateTodo = async (req, res) => {
  try {
      const updateData = req.body; // pakai semua yang dikirim dari client
      const updatedTodo = await Todo.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
      );
      if (!updatedTodo) return res.status(404).json({ message: 'Todo tidak ditemukan' });
      res.json(updatedTodo);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// UPDATE - Ubah status completed
exports.toggleComplete = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Task tidak ditemukan' });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({ message: 'Status todo diperbarui', todo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE - Todo by ID
exports.deleteTodo = async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ message: 'Todo tidak ditemukan' });
    res.json({ message: 'Todo berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
