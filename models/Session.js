const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    username: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + (process.env.SESSION_TIMEOUT || 24 * 60 * 60 * 1000));
    }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Session', sessionSchema); 