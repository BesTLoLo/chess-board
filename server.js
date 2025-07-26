const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for tournament data
let tournamentData = {
  players: {},
  matches: [],
  nextMatchId: 1
};

// Helper function to calculate player statistics
function calculatePlayerStats(playerName) {
  const playerMatches = tournamentData.matches.filter(match => 
    match.player1 === playerName || match.player2 === playerName
  );

  let wins = 0;
  let losses = 0;
  let draws = 0;

  playerMatches.forEach(match => {
    if (match.result === 'draw') {
      draws++;
    } else if (match.winner === playerName) {
      wins++;
    } else {
      losses++;
    }
  });

  const totalGames = wins + losses + draws;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

  return { wins, losses, draws, totalGames, winRate };
}

// Routes
app.get('/api/players', (req, res) => {
  const playersWithStats = Object.keys(tournamentData.players).map(playerName => {
    const stats = calculatePlayerStats(playerName);
    return {
      name: playerName,
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
});

app.post('/api/players', (req, res) => {
  const { playerName } = req.body;
  
  if (!playerName || playerName.trim() === '') {
    return res.status(400).json({ error: 'Player name is required' });
  }

  const trimmedName = playerName.trim();
  
  if (tournamentData.players[trimmedName]) {
    return res.status(400).json({ error: 'Player already exists' });
  }

  tournamentData.players[trimmedName] = {
    name: trimmedName,
    dateAdded: new Date().toISOString()
  };

  res.json({ message: 'Player added successfully', player: trimmedName });
});

app.get('/api/matches', (req, res) => {
  // Sort matches by most recent first
  const sortedMatches = [...tournamentData.matches].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json(sortedMatches);
});

app.post('/api/matches', (req, res) => {
  const { player1, player2, result, winner } = req.body;
  
  if (!player1 || !player2) {
    return res.status(400).json({ error: 'Both players are required' });
  }

  if (player1 === player2) {
    return res.status(400).json({ error: 'Players must be different' });
  }

  if (!tournamentData.players[player1] || !tournamentData.players[player2]) {
    return res.status(400).json({ error: 'One or both players do not exist' });
  }

  if (!['win', 'draw'].includes(result)) {
    return res.status(400).json({ error: 'Invalid result type' });
  }

  if (result === 'win' && ![player1, player2].includes(winner)) {
    return res.status(400).json({ error: 'Invalid winner' });
  }

  const match = {
    id: tournamentData.nextMatchId++,
    player1,
    player2,
    result,
    winner: result === 'win' ? winner : null,
    timestamp: new Date().toISOString()
  };

  tournamentData.matches.push(match);
  res.json({ message: 'Match recorded successfully', match });
});

app.delete('/api/matches/:id', (req, res) => {
  const matchId = parseInt(req.params.id);
  const matchIndex = tournamentData.matches.findIndex(match => match.id === matchId);
  
  if (matchIndex === -1) {
    return res.status(404).json({ error: 'Match not found' });
  }

  tournamentData.matches.splice(matchIndex, 1);
  res.json({ message: 'Match deleted successfully' });
});

app.post('/api/reset', (req, res) => {
  tournamentData = {
    players: {},
    matches: [],
    nextMatchId: 1
  };
  res.json({ message: 'Tournament reset successfully' });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chess Scoreboard server running on http://localhost:${PORT}`);
}); 