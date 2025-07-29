// Submit page JavaScript for Chess Tournament Manager
class MatchSubmissionManager {
    constructor() {
        this.players = [];
        this.matches = [];
        this.sessionId = null;
        this.init();
    }

    async init() {
        // Check authentication first
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
            window.location.href = 'login.html?redirect=submit.html&message=auth_required';
            return;
        }

        this.setupEventListeners();
        await this.loadData();
    }

    async checkAuthentication() {
        this.sessionId = localStorage.getItem('chess_session_id');
        if (!this.sessionId) return false;

        try {
            const response = await fetch('/api/auth/check', {
                headers: {
                    'X-Session-Id': this.sessionId
                }
            });

            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Session-Id': this.sessionId
        };
    }

    setupEventListeners() {
        // Add player button
        document.getElementById('addPlayerBtn').addEventListener('click', () => {
            this.addPlayer();
        });

        // Add player on Enter key
        document.getElementById('newPlayerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPlayer();
            }
        });

        // Match form submission
        document.getElementById('matchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMatch();
        });

        // Player selection change handlers
        document.getElementById('player1Select').addEventListener('change', () => {
            this.validatePlayerSelection();
        });
        
        document.getElementById('player2Select').addEventListener('change', () => {
            this.validatePlayerSelection();
        });
    }

    async loadData() {
        await Promise.all([
            this.loadPlayers(),
            this.loadMatches()
        ]);
    }

    async loadPlayers() {
        try {
            const response = await fetch('/api/players');
            this.players = await response.json();
            this.updatePlayersDisplay();
            this.updatePlayerSelectors();
        } catch (error) {
            console.error('Error loading players:', error);
            this.showError('Failed to load players');
        }
    }

    async loadMatches() {
        try {
            const response = await fetch('/api/matches');
            this.matches = await response.json();
            this.updateMatchesDisplay();
        } catch (error) {
            console.error('Error loading matches:', error);
            this.showError('Failed to load matches');
        }
    }

    async addPlayer() {
        const playerNameInput = document.getElementById('newPlayerName');
        const playerName = playerNameInput.value.trim();

        if (!playerName) {
            this.showError('Please enter a player name');
            return;
        }

        // Check if player already exists
        if (this.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
            this.showError('Player already exists');
            return;
        }

        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ playerName })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess(`Player "${playerName}" added successfully`);
                playerNameInput.value = '';
                await this.loadPlayers();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to add player');
            }
        } catch (error) {
            console.error('Error adding player:', error);
            this.showError('Failed to add player');
        }
    }

    async submitMatch() {
        const player1 = document.getElementById('player1Select').value;
        const player2 = document.getElementById('player2Select').value;
        const resultRadio = document.querySelector('input[name="result"]:checked');

        if (!player1 || !player2) {
            this.showError('Please select both players');
            return;
        }

        if (player1 === player2) {
            this.showError('Please select different players');
            return;
        }

        if (!resultRadio) {
            this.showError('Please select a match result');
            return;
        }

        const resultValue = resultRadio.value;
        let result, winner;

        if (resultValue === 'draw') {
            result = 'draw';
            winner = null;
        } else if (resultValue === 'player1-win') {
            result = 'win';
            winner = player1;
        } else if (resultValue === 'player2-win') {
            result = 'win';
            winner = player2;
        }

        try {
            const response = await fetch('/api/matches', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    player1,
                    player2,
                    result,
                    winner
                })
            });

            if (response.ok) {
                const resultData = await response.json();
                let message;
                if (result === 'draw') {
                    message = `Match recorded: ${player1} vs ${player2} - Draw`;
                } else {
                    message = `Match recorded: ${winner} defeats ${winner === player1 ? player2 : player1}`;
                }
                this.showSuccess(message);
                this.resetForm();
                await this.loadData();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to record match');
            }
        } catch (error) {
            console.error('Error submitting match:', error);
            this.showError('Failed to record match');
        }
    }

    async deleteMatch(matchId) {
        if (!confirm('Are you sure you want to delete this match?')) {
            return;
        }

        try {
            const response = await fetch(`/api/matches/${matchId}`, {
                method: 'DELETE',
                headers: {
                    'X-Session-Id': this.sessionId
                }
            });

            if (response.ok) {
                this.showSuccess('Match deleted successfully');
                await this.loadData();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to delete match');
            }
        } catch (error) {
            console.error('Error deleting match:', error);
            this.showError('Failed to delete match');
        }
    }

    async deletePlayer(playerName) {
        if (!confirm(`Are you sure you want to remove "${playerName}" from the tournament? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/players/${encodeURIComponent(playerName)}`, {
                method: 'DELETE',
                headers: {
                    'X-Session-Id': this.sessionId
                }
            });

            if (response.ok) {
                this.showSuccess(`Player "${playerName}" removed successfully`);
                await this.loadData();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to remove player');
            }
        } catch (error) {
            console.error('Error deleting player:', error);
            this.showError('Failed to remove player');
        }
    }

    validatePlayerSelection() {
        const player1 = document.getElementById('player1Select').value;
        const player2 = document.getElementById('player2Select').value;

        // Update result option labels
        const resultOptions = document.querySelectorAll('.result-option');
        const player1Name = player1 ? this.getPlayerName(player1) : 'Player 1';
        const player2Name = player2 ? this.getPlayerName(player2) : 'Player 2';

        resultOptions[0].querySelector('span').textContent = `${player1Name} Wins`;
        resultOptions[1].querySelector('span').textContent = `${player2Name} Wins`;
    }

    getPlayerName(playerName) {
        return playerName.length > 12 ? playerName.substring(0, 12) + '...' : playerName;
    }

    resetForm() {
        document.getElementById('matchForm').reset();
        this.validatePlayerSelection();
    }

    updatePlayersDisplay() {
        const playersListContainer = document.getElementById('playersList');
        
        if (this.players.length === 0) {
            playersListContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No players added yet</p>
                </div>
            `;
            return;
        }

        playersListContainer.innerHTML = this.players.map(player => {
            const hasMatches = (player.totalGames || 0) > 0;
            const deleteButton = hasMatches ? '' : `
                <button class="delete-player" onclick="matchManager.deletePlayer('${player.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            return `
                <div class="player-item">
                    <i class="fas fa-user"></i>
                    <span>${player.name}</span>
                    <div class="player-stats">
                        <small>${player.wins || 0}W ${player.losses || 0}L ${player.draws || 0}D</small>
                    </div>
                    ${deleteButton}
                </div>
            `;
        }).join('');
    }

    updatePlayerSelectors() {
        const player1Select = document.getElementById('player1Select');
        const player2Select = document.getElementById('player2Select');

        // Store current selections
        const currentPlayer1 = player1Select.value;
        const currentPlayer2 = player2Select.value;

        // Clear and populate selectors
        const playerOptions = this.players.map(player => 
            `<option value="${player.name}">${player.name}</option>`
        ).join('');

        player1Select.innerHTML = `<option value="">Select Player 1</option>${playerOptions}`;
        player2Select.innerHTML = `<option value="">Select Player 2</option>${playerOptions}`;

        // Restore selections if still valid
        if (this.players.some(p => p.name === currentPlayer1)) {
            player1Select.value = currentPlayer1;
        }
        if (this.players.some(p => p.name === currentPlayer2)) {
            player2Select.value = currentPlayer2;
        }

        this.validatePlayerSelection();
    }

    updateMatchesDisplay() {
        const matchesListContainer = document.getElementById('recentMatchesList');
        
        if (this.matches.length === 0) {
            matchesListContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-chess"></i>
                    <p>No matches recorded yet</p>
                </div>
            `;
            return;
        }

        matchesListContainer.innerHTML = this.matches.slice(0, 10).map(match => {
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
                <div class="match-item ${resultClass}">
                    <div class="match-info">
                        <div class="match-players">${match.player1} vs ${match.player2}</div>
                        <div class="match-result">${resultText}</div>
                    </div>
                    <div class="match-time">${matchTime}</div>
                    <button class="delete-match" onclick="matchManager.deleteMatch(${match.matchId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
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

// Initialize the match submission manager when page loads
let matchManager;
document.addEventListener('DOMContentLoaded', () => {
    matchManager = new MatchSubmissionManager();
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
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 