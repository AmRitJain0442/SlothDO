const mongoose = require('mongoose');

// Function to generate unique unit ID
function generateUnitId() {
  return 'item_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const TodoItemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoList',
    required: true
  },
  unitId: {
    type: String,
    unique: true,
    required: true,
    default: generateUnitId
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
TodoItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TodoItem', TodoItemSchema); 