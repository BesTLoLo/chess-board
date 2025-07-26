const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: Number,
    required: true,
    unique: true
  },
  player1: {
    type: String,
    required: true,
    ref: 'Player'
  },
  player2: {
    type: String,
    required: true,
    ref: 'Player'
  },
  result: {
    type: String,
    required: true,
    enum: ['win', 'draw']
  },
  winner: {
    type: String,
    default: null,
    ref: 'Player'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better performance
matchSchema.index({ matchId: 1 });
matchSchema.index({ player1: 1, player2: 1 });
matchSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Match', matchSchema); 