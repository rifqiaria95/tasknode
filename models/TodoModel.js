const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' }
});

module.exports = mongoose.model('Todo', todoSchema);
