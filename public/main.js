// Main page JavaScript for Chess Tournament Manager
class TournamentOverview {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        await this.loadQuickStats();
        this.updateUI();
    }

    async checkAuthentication() {
        const sessionId = localStorage.getItem('chess_session_id');
        if (!sessionId) return;

        try {
            const response = await fetch('/api/auth/check', {
                headers: {
                    'X-Session-Id': sessionId
                }
            });

            const data = await response.json();
            if (data.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    }

    updateUI() {
        const submitBtnContainer = document.getElementById('submitBtnContainer');
        const authStatus = document.getElementById('authStatus');
        const currentUserElement = document.getElementById('currentUser');

        if (this.isAuthenticated) {
            // Show authenticated submit button
            submitBtnContainer.innerHTML = `
                <a href="submit.html" class="nav-btn">
                    <i class="fas fa-edit"></i>
                    Submit Score
                </a>
            `;

            // Show auth status
            authStatus.style.display = 'block';
            if (currentUserElement) {
                currentUserElement.textContent = this.currentUser.username;
            }
        } else {
            // Show login required button
            submitBtnContainer.innerHTML = `
                <a href="login.html" class="nav-btn login-required">
                    <i class="fas fa-lock"></i>
                    Login Required
                </a>
            `;

            // Hide auth status
            authStatus.style.display = 'none';
        }
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

// Global logout function
async function handleLogout() {
    const sessionId = localStorage.getItem('chess_session_id');
    
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'X-Session-Id': sessionId
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear local session
    localStorage.removeItem('chess_session_id');
    
    // Reload page to update UI
    window.location.reload();
}

// Initialize when page loads
let tournamentOverview;
document.addEventListener('DOMContentLoaded', () => {
    tournamentOverview = new TournamentOverview();
}); 