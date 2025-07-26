const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');

const connectDB = require('./config/database');

// Import MongoDB models
const Player = require('./models/Player');
const Match = require('./models/Match');
const Session = require('./models/Session');
const Counter = require('./models/Counter');
const { getNextSequence, calculatePlayerStats } = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple user credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'defaultpassword'
};

// Generate simple session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Authentication middleware
async function requireAuth(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if session is expired (MongoDB TTL should handle this, but double-check)
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ sessionId });
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Update session timestamp
    session.timestamp = new Date();
    session.expiresAt =new Date(Date.now() + Number(process.env.SESSION_TIMEOUT || 86400000));
    await session.save();
    
    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Authentication Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const sessionId = generateSessionId();
      
      // Create new session in MongoDB
      const session = new Session({
        sessionId,
        user: { username },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + Number(process.env.SESSION_TIMEOUT || 86400000))
      });
      
      await session.save();
      
      res.json({ 
        success: true, 
        sessionId,
        user: { username }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
      await Session.deleteOne({ sessionId });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/check', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({ authenticated: false });
    }
    
    const session = await Session.findOne({ sessionId });
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await Session.deleteOne({ sessionId });
      }
      return res.json({ authenticated: false });
    }
    
    res.json({ 
      authenticated: true, 
      user: session.user 
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ authenticated: false });
  }
});

// Public Routes (no authentication required)
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find({});
    const matches = await Match.find({});
    
    const playersWithStats = players.map(player => {
      const stats = calculatePlayerStats(matches, player.name);
      return {
        name: player.name,
        ...stats
      };
    });
    
    // Sort by win rate, then by total wins
    playersWithStats.sort((a, b) => {
      if (parseFloat(b.winRate) !== parseFloat(a.winRate)) {
        return parseFloat(b.winRate) - parseFloat(a.winRate);
      }
      return b.wins - a.wins;
    });

    res.json(playersWithStats);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected Routes (authentication required)
app.post('/api/players', requireAuth, async (req, res) => {
  try {
    const { playerName } = req.body;
    
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const trimmedName = playerName.trim();
    
    // Check if player already exists
    const existingPlayer = await Player.findOne({ name: trimmedName });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Player already exists' });
    }

    const player = new Player({
      name: trimmedName,
      dateAdded: new Date()
    });

    await player.save();
    res.json({ message: 'Player added successfully', player: trimmedName });
  } catch (error) {
    console.error('Add player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find({}).sort({ timestamp: -1 });
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/matches', requireAuth, async (req, res) => {
  try {
    const { player1, player2, result, winner } = req.body;
    
    if (!player1 || !player2) {
      return res.status(400).json({ error: 'Both players are required' });
    }

    if (player1 === player2) {
      return res.status(400).json({ error: 'Players must be different' });
    }

    // Check if both players exist
    const player1Exists = await Player.findOne({ name: player1 });
    const player2Exists = await Player.findOne({ name: player2 });
    
    if (!player1Exists || !player2Exists) {
      return res.status(400).json({ error: 'One or both players do not exist' });
    }

    if (!['win', 'draw'].includes(result)) {
      return res.status(400).json({ error: 'Invalid result type' });
    }

    if (result === 'win' && ![player1, player2].includes(winner)) {
      return res.status(400).json({ error: 'Invalid winner' });
    }

    // Get next match ID
    const matchId = await getNextSequence('matchId');

    const match = new Match({
      matchId,
      player1,
      player2,
      result,
      winner: result === 'win' ? winner : null,
      timestamp: new Date()
    });

    await match.save();
    res.json({ message: 'Match recorded successfully', match });
  } catch (error) {
    console.error('Add match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/matches/:id', requireAuth, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const match = await Match.findOneAndDelete({ matchId });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reset', requireAuth, async (req, res) => {
  try {
    // Delete all players, matches, and reset counters
    await Player.deleteMany({});
    await Match.deleteMany({});
    await Counter.deleteMany({});
    
    res.json({ message: 'Tournament reset successfully' });
  } catch (error) {
    console.error('Reset tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chess Scoreboard server running on http://localhost:${PORT}`);
}); 