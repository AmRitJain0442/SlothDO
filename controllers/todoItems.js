const TodoItem = require('../models/TodoItem');
const TodoList = require('../models/TodoList');

// Get all items in database
exports.getAllItems = async (req, res) => {
  try {
    const items = await TodoItem.find()
      .populate('listId', 'name description')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error in getAllItems:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get one item by unitId
exports.getOneItem = async (req, res) => {
  try {
    const item = await TodoItem.findOne({ unitId: req.params.unitId })
      .populate('listId', 'name description');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error('Error in getOneItem:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create new item in a specific list
exports.createItem = async (req, res) => {
  try {
    console.log('Creating item with data:', req.body);
    
    // Check if the list exists
    const todoList = await TodoList.findById(req.body.listId);
    if (!todoList) {
      console.log('Todo list not found:', req.body.listId);
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const todoItem = new TodoItem({
      content: req.body.content,
      listId: req.body.listId,
      completed: req.body.completed || false
    });

    console.log('Attempting to save item:', todoItem);
    const newTodoItem = await todoItem.save();
    await newTodoItem.populate('listId', 'name description');
    
    console.log('Item created successfully:', newTodoItem);
    res.status(201).json(newTodoItem);
  } catch (err) {
    console.error('Error in createItem:', err);
    console.error('Error details:', err.message);
    console.error('Error name:', err.name);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }
    res.status(400).json({ 
      message: err.message,
      details: err.errors || 'No additional details'
    });
  }
};

// Update item content and completion status
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await TodoItem.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        completed: req.body.completed,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('listId', 'name description');
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (err) {
    console.error('Error in updateItem:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update item by unitId
exports.updateItemByUnitId = async (req, res) => {
  try {
    const updatedItem = await TodoItem.findOneAndUpdate(
      { unitId: req.params.unitId },
      {
        content: req.body.content,
        completed: req.body.completed,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('listId', 'name description');
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (err) {
    console.error('Error in updateItemByUnitId:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await TodoItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error in deleteItem:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete item by unitId
exports.deleteItemByUnitId = async (req, res) => {
  try {
    const deletedItem = await TodoItem.findOneAndDelete({ unitId: req.params.unitId });
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error in deleteItemByUnitId:', err);
    res.status(500).json({ message: err.message });
  }
}; 