// Login page JavaScript for Chess Tournament Manager
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    setupEventListeners() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Enter key press on form fields
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
        });

        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
        });

        // Auto-focus username field
        document.getElementById('username').focus();
    }

    async checkExistingAuth() {
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
                this.showSuccess('Already logged in! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'submit.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Clear any existing messages
        this.clearMessages();

        // Validate input
        if (!username) {
            this.showError('Please enter your username');
            document.getElementById('username').focus();
            return;
        }

        if (!password) {
            this.showError('Please enter your password');
            document.getElementById('password').focus();
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store session ID
                localStorage.setItem('chess_session_id', data.sessionId);
                
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect to submit page after a short delay
                setTimeout(() => {
                    window.location.href = 'submit.html';
                }, 1000);
                
            } else {
                this.showError(data.error || 'Login failed');
                this.setLoadingState(false);
                
                // Clear password field on error
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            usernameInput.disabled = true;
            passwordInput.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            usernameInput.disabled = false;
            passwordInput.disabled = false;
        }
    }

    showError(message) {
        this.clearMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const form = document.getElementById('loginForm');
        form.insertBefore(errorDiv, form.firstChild);
    }

    showSuccess(message) {
        this.clearMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        const form = document.getElementById('loginForm');
        form.insertBefore(successDiv, form.firstChild);
    }

    clearMessages() {
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
    }
}

// Global function for password visibility toggle
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleButton.className = 'fas fa-eye';
    }
}

// Initialize login manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Check for redirect parameter
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const message = urlParams.get('message');
    
    if (message === 'auth_required') {
        setTimeout(() => {
            const loginManager = new LoginManager();
            loginManager.showError('Please log in to access the admin area');
        }, 500);
    }
    
    // Store redirect URL for after login
    if (redirect) {
        sessionStorage.setItem('login_redirect', redirect);
    }
});

// Handle successful login redirect
window.addEventListener('storage', (e) => {
    if (e.key === 'chess_session_id' && e.newValue) {
        // Session was set, check for redirect
        const redirectUrl = sessionStorage.getItem('login_redirect');
        if (redirectUrl) {
            sessionStorage.removeItem('login_redirect');
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'submit.html';
        }
    }
}); 