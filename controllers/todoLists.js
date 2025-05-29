const TodoList = require('../models/TodoList');
const TodoItem = require('../models/TodoItem');

// Get all todo lists
exports.getAllTodoLists = async (req, res) => {
  try {
    const todoLists = await TodoList.find().sort({ createdAt: -1 });
    res.json(todoLists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific todo list
exports.getTodoList = async (req, res) => {
  try {
    const todoList = await TodoList.findById(req.params.id);
    if (!todoList) {
      return res.status(404).json({ message: 'Todo list not found' });
    }
    res.json(todoList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new todo list
exports.createTodoList = async (req, res) => {
  const todoList = new TodoList({
    name: req.body.name,
    description: req.body.description || ""
  });

  try {
    const newTodoList = await todoList.save();
    res.status(201).json(newTodoList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update todo list name/description
exports.updateTodoList = async (req, res) => {
  try {
    const updatedTodoList = await TodoList.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedTodoList) {
      return res.status(404).json({ message: 'Todo list not found' });
    }
    
    res.json(updatedTodoList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete todo list and all its items
exports.deleteTodoList = async (req, res) => {
  try {
    const todoList = await TodoList.findById(req.params.id);
    if (!todoList) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    // Delete all items in this list
    await TodoItem.deleteMany({ listId: req.params.id });
    
    // Delete the list itself
    await TodoList.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Todo list and all items deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all items from a specific todo list
exports.getItemsFromList = async (req, res) => {
  try {
    const items = await TodoItem.find({ listId: req.params.id })
      .populate('listId', 'name description')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 