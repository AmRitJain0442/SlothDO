const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (require authentication)
router.get('/profile', authController.authenticateToken, authController.getProfile);
router.put('/profile', authController.authenticateToken, authController.updateProfile);
router.get('/dashboard', authController.authenticateToken, authController.getDashboard);

module.exports = router; 