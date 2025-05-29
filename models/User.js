const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 120
  },
  profession: {
    type: String,
    required: true,
    enum: ['student', 'working_professional']
  },
  interests: [{
    type: String,
    enum: [
      'art', 'painting', 'web_development', 'app_development', 'music',
      'photography', 'writing', 'reading', 'gaming', 'sports', 'cooking',
      'travel', 'fitness', 'dancing', 'singing', 'coding', 'design',
      'entrepreneurship', 'marketing', 'data_science', 'ai_ml', 'blockchain',
      'cybersecurity', 'mobile_dev', 'backend_dev', 'frontend_dev'
    ]
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 