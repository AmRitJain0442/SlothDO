require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// MongoDB Connection (modern version)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
const todoRoutes = require('./routes/todos');
const todoListRoutes = require('./routes/todoLists');
const todoItemRoutes = require('./routes/todoItems');
const authRoutes = require('./routes/auth');

app.use('/api/todos', todoRoutes);
app.use('/api/todolists', todoListRoutes);
app.use('/api/todoitems', todoItemRoutes);
app.use('/api/auth', authRoutes);

// Redirect root to landing page
app.get('/', (req, res) => {
  res.redirect('/landing.html');
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));