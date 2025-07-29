// Scoreboard page JavaScript for Chess Tournament Manager
class ScoreboardManager {
    constructor() {
        this.players = [];
        this.matches = [];
        this.currentSort = { field: 'points', direction: 'desc' };
        this.init();
    }

    async init() {
        await this.loadData();
        this.updateLastUpdated();
    }

    async loadData() {
        try {
            const [playersResponse, matchesResponse] = await Promise.all([
                fetch('/api/players'),
                fetch('/api/matches')
            ]);

            this.players = await playersResponse.json();
            this.matches = await matchesResponse.json();

            this.updateScoreboard();
            this.updateTournamentStats();
            this.updateRecentActivity();
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load tournament data');
        }
    }

    sortBy(field) {
        // Toggle direction if same field, otherwise default to descending
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'desc' ? 'asc' : 'desc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'desc';
        }

        this.sortPlayers();
        this.updateScoreboard();
    }

    sortPlayers() {
        const { field, direction } = this.currentSort;
        
        this.players.sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];

            // Handle numeric fields
            const numericFields = ['points', 'wins', 'losses', 'draws', 'totalGames'];
            if (numericFields.includes(field)) {
                aValue = parseInt(aValue || 0);
                bValue = parseInt(bValue || 0);
            }

            // Sort logic
            if (direction === 'desc') {
                return bValue - aValue;
            } else {
                return aValue - bValue;
            }
        });
    }

    updateScoreboard() {
        const scoreboardBody = document.getElementById('scoreboardBody');
        
        if (this.players.length === 0) {
            scoreboardBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="no-data">
                            <i class="fas fa-users"></i>
                            <p>No players in the tournament yet</p>
                            <small>Add players on the Submit Match page</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        scoreboardBody.innerHTML = this.players.map((player, index) => {
            const rank = index + 1;
            const rankClass = this.getRankClass(rank);
            const pointsClass = this.getPointsClass(player.points);
            const avatar = this.getPlayerAvatar(player.name);

            return `
                <tr>
                    <td class="rank-col">
                        <div class="rank-badge ${rankClass}">${rank}</div>
                    </td>
                    <td class="player-col">
                        <div class="player-name">
                            <div class="player-avatar">${avatar}</div>
                            <span>${player.name}</span>
                        </div>
                    </td>
                    <td class="wins-col">
                        <span class="stat-number-cell wins">${player.wins || 0}</span>
                    </td>
                    <td class="losses-col">
                        <span class="stat-number-cell losses">${player.losses || 0}</span>
                    </td>
                    <td class="draws-col">
                        <span class="stat-number-cell draws">${player.draws || 0}</span>
                    </td>
                    <td class="total-col">
                        <span class="stat-number-cell">${player.totalGames || 0}</span>
                    </td>
                    <td class="points-col">
                        <span class="points ${pointsClass}">${player.points || 0}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateTournamentStats() {
        // Total players
        document.getElementById('totalPlayers').textContent = this.players.length;

        // Total matches
        document.getElementById('totalMatches').textContent = this.matches.length;

        // Top player
        const topPlayerElement = document.getElementById('topPlayer');
        if (this.players.length > 0) {
            // Sort by points for top player
            const topPlayer = [...this.players].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.wins - a.wins; // Tie-breaker: most wins
            })[0];
            
            const displayName = topPlayer.name.length > 10 ? 
                topPlayer.name.substring(0, 10) + '...' : topPlayer.name;
            topPlayerElement.textContent = displayName;
        } else {
            topPlayerElement.textContent = '-';
        }
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        
        if (this.matches.length === 0) {
            activityContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-chess"></i>
                    <p>No matches played yet</p>
                </div>
            `;
            return;
        }

        const recentMatches = this.matches.slice(0, 8);
        
        activityContainer.innerHTML = recentMatches.map(match => {
            const matchTime = new Date(match.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let resultText, resultClass;
            if (match.result === 'draw') {
                resultText = 'Draw';
                resultClass = 'draw';
            } else {
                resultText = `${match.winner} won`;
                resultClass = 'win';
            }

            return `
                <div class="activity-item ${resultClass}">
                    <div class="activity-info">
                        <div class="activity-players">${match.player1} vs ${match.player2}</div>
                        <div class="activity-result">${resultText}</div>
                    </div>
                    <div class="activity-time">${matchTime}</div>
                </div>
            `;
        }).join('');
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        lastUpdatedElement.textContent = `Updated: ${timeString}`;
    }

    getRankClass(rank) {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return 'default';
    }

    getPointsClass(points) {
        const pointValue = points || 0;
        if (pointValue >= 10) return 'excellent';
        if (pointValue >= 6) return 'good';
        if (pointValue >= 3) return 'average';
        return 'poor';
    }

    getPlayerAvatar(playerName) {
        // Return first letter of player name
        return playerName.charAt(0).toUpperCase();
    }

    async resetTournament() {
        const confirmMessage = 'Are you sure you want to reset the entire tournament?\n\nThis will delete:\n• All players\n• All match results\n• All statistics\n\nThis action cannot be undone.';
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const sessionId = localStorage.getItem('chess_session_id');
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'X-Session-Id': sessionId
                }
            });

            if (response.ok) {
                this.showSuccess('Tournament reset successfully');
                await this.loadData();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to reset tournament');
            }
        } catch (error) {
            console.error('Error resetting tournament:', error);
            this.showError('Failed to reset tournament');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }
}

// Initialize the scoreboard manager when page loads
let scoreboardManager;
document.addEventListener('DOMContentLoaded', () => {
    scoreboardManager = new ScoreboardManager();
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 1000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
        min-width: 300px;
    }

    .notification-success {
        background: linear-gradient(135deg, #48bb78, #38a169);
    }

    .notification-error {
        background: linear-gradient(135deg, #f56565, #e53e3e);
    }

    .notification-info {
        background: linear-gradient(135deg, #4299e1, #3182ce);
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.1rem;
        opacity: 0.8;
        transition: opacity 0.2s;
    }

    .notification-close:hover {
        opacity: 1;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .fa-spin {
        animation: fa-spin 1s infinite linear;
    }

    @keyframes fa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 