const express = require('express');
const router = express.Router();
const todoItemController = require('../controllers/todoItems');

// Get all items in database
router.get('/', todoItemController.getAllItems);

// Get one item by unitId
router.get('/unit/:unitId', todoItemController.getOneItem);

// Create new item
router.post('/', todoItemController.createItem);

// Update item by ID
router.put('/:id', todoItemController.updateItem);

// Update item by unitId
router.put('/unit/:unitId', todoItemController.updateItemByUnitId);

// Delete item by ID
router.delete('/:id', todoItemController.deleteItem);

// Delete item by unitId
router.delete('/unit/:unitId', todoItemController.deleteItemByUnitId);

module.exports = router; 