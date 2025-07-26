// Main page JavaScript for Chess Tournament Manager
class TournamentOverview {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadQuickStats();
    }

    async loadQuickStats() {
        try {
            // Fetch players and matches data
            const [playersResponse, matchesResponse] = await Promise.all([
                fetch('/api/players'),
                fetch('/api/matches')
            ]);

            const players = await playersResponse.json();
            const matches = await matchesResponse.json();

            // Update stats display
            this.updateStatsDisplay(players, matches);
        } catch (error) {
            console.error('Error loading stats:', error);
            // Show default values if there's an error
            this.updateStatsDisplay([], []);
        }
    }

    updateStatsDisplay(players, matches) {
        // Total players
        document.getElementById('totalPlayers').textContent = players.length;

        // Total matches
        document.getElementById('totalMatches').textContent = matches.length;

        // Last activity
        const recentActivityElement = document.getElementById('recentActivity');
        if (matches.length > 0) {
            const lastMatch = matches[0]; // matches are sorted by most recent first
            const lastMatchDate = new Date(lastMatch.timestamp);
            const today = new Date();
            
            // Calculate time difference
            const diffTime = today - lastMatchDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            let activityText;
            if (diffDays > 0) {
                activityText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                activityText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMinutes > 0) {
                activityText = `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
            } else {
                activityText = 'Just now';
            }

            recentActivityElement.textContent = activityText;
        } else {
            recentActivityElement.textContent = 'No matches yet';
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TournamentOverview();
}); 