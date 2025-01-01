// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  ],
  user: {
    // Bu görevi oluşturan kullanıcının ID'si
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // required: false (zorunlu değil)
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['todo', 'inProgress', 'done'],
    default: 'todo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Task', taskSchema);
