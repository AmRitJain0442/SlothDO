const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, password, age, profession, interests } = req.body;
    
    console.log('Registration attempt:', { username, age, profession, interests: interests?.length });
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Validate required fields
    if (!username || !password || !age || !profession) {
      return res.status(400).json({ 
        message: 'Username, password, age, and profession are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      password,
      age: parseInt(age),
      profession,
      interests: interests || [],
      profileCompleted: true
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      age: user.age,
      profession: user.profession,
      interests: user.interests,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt
    };
    
    console.log('User registered successfully:', userData.username);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await user.updateLastLogin();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      age: user.age,
      profession: user.profession,
      interests: user.interests,
      profileCompleted: user.profileCompleted,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
    
    console.log('User logged in successfully:', userData.username);
    
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        age: user.age,
        profession: user.profession,
        interests: user.interests,
        profileCompleted: user.profileCompleted,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { age, profession, interests } = req.body;
    
    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age);
    if (profession) updateData.profession = profession;
    if (interests) updateData.interests = interests;
    updateData.updatedAt = Date.now();
    updateData.profileCompleted = true;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        age: user.age,
        profession: user.profession,
        interests: user.interests,
        profileCompleted: user.profileCompleted,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's todo lists count (you can expand this)
    const TodoList = require('../models/TodoList');
    const TodoItem = require('../models/TodoItem');
    
    const totalLists = await TodoList.countDocuments();
    const totalItems = await TodoItem.countDocuments();
    const completedItems = await TodoItem.countDocuments({ completed: true });
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        age: user.age,
        profession: user.profession,
        interests: user.interests,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      stats: {
        totalLists,
        totalItems,
        completedItems,
        pendingItems: totalItems - completedItems
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard data' });
  }
};

// Middleware to verify JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
}; 