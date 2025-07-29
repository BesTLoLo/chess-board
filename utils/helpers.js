const Counter = require('../models/Counter');

// Helper function to get next sequence number for auto-incrementing IDs
async function getNextSequence(name) {
  try {
    const counter = await Counter.findByIdAndUpdate(
      name,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    return counter.sequence_value;
  } catch (error) {
    console.error('Error getting next sequence:', error);
    throw error;
  }
}

// Helper function to calculate player statistics from matches
function calculatePlayerStats(matches, playerName) {
  const playerMatches = matches.filter(match => 
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
  const points = (wins * 2) + (draws * 1) + (losses * 0); // Win=2, Draw=1, Loss=0

  return { wins, losses, draws, totalGames, points };
}

module.exports = {
  getNextSequence,
  calculatePlayerStats
}; 