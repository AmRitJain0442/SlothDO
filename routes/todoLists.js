const express = require('express');
const router = express.Router();
const todoListController = require('../controllers/todoLists');

// TodoList CRUD Routes
router.get('/', todoListController.getAllTodoLists);
router.get('/:id', todoListController.getTodoList);
router.post('/', todoListController.createTodoList);
router.put('/:id', todoListController.updateTodoList);
router.delete('/:id', todoListController.deleteTodoList);

// Get items from a specific list
router.get('/:id/items', todoListController.getItemsFromList);

module.exports = router; 