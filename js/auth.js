// Authentication System for travl
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('travl_users')) || [];
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Modal triggers
        document.getElementById('btn-login')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('btn-signup')?.addEventListener('click', () => this.showSignupModal());
        document.getElementById('btn-logout')?.addEventListener('click', () => this.logout());
        document.getElementById('cta-signup')?.addEventListener('click', () => this.showSignupModal());

        // Modal switches
        document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideLoginModal();
            this.showSignupModal();
        });

        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideSignupModal();
            this.showLoginModal();
        });

        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));

        // Modal closes
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.hideAllModals());
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });

        // Protected route links
        document.querySelectorAll('.protected-route').forEach(link => {
            link.addEventListener('click', (e) => this.handleProtectedRoute(e));
        });
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'block';
        this.clearAuthMessages();
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    showSignupModal() {
        document.getElementById('signup-modal').style.display = 'block';
        this.clearAuthMessages();
    }

    hideSignupModal() {
        document.getElementById('signup-modal').style.display = 'none';
    }

    hideAllModals() {
        this.hideLoginModal();
        this.hideSignupModal();
    }

    clearAuthMessages() {
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('signup-error').style.display = 'none';
        document.getElementById('signup-success').style.display = 'none';
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.login(user);
        } else {
            this.showLoginError('invalid_credentials');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validation
        if (password !== confirmPassword) {
            this.showSignupError('password_mismatch');
            return;
        }

        if (password.length < 6) {
            this.showSignupError('password_too_short');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showSignupError('email_exists');
            return;
        }

        // Create new user
        const newUser = {
            id: this.generateUserId(),
            name,
            email,
            password,
            createdAt: new Date().toISOString(),
            bookings: []
        };

        this.users.push(newUser);
        this.saveUsers();
        this.showSignupSuccess('account_created');
        
        // Clear form
        e.target.reset();
        
        // Switch to login after a delay
        setTimeout(() => {
            this.hideSignupModal();
            this.showLoginModal();
        }, 2000);
    }

    login(user) {
        this.currentUser = user;
        localStorage.setItem('travl_current_user', JSON.stringify(user));
        this.updateUI();
        this.hideLoginModal();
        this.showNotification('welcome_back', { name: user.name });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('travl_current_user');
        this.updateUI();
        this.showNotification('logged_out');
    }

    checkExistingSession() {
        const storedUser = localStorage.getItem('travl_current_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }
    }

    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userGreeting = document.getElementById('user-greeting');
        const usernameDisplay = document.getElementById('username-display');

        if (this.currentUser) {
            authButtons.style.display = 'none';
            userGreeting.style.display = 'flex';
            usernameDisplay.textContent = this.currentUser.name;
        } else {
            authButtons.style.display = 'flex';
            userGreeting.style.display = 'none';
        }
    }

    handleProtectedRoute(e) {
        if (!this.currentUser) {
            e.preventDefault();
            this.showLoginModal();
            this.showLoginError('login_required');
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Translation helper method
    t(key, params = {}) {
        // Use the global i18n instance if available
        if (window.i18n && typeof window.i18n.t === 'function') {
            return window.i18n.t(key, params);
        }
        
        // Fallback to English if i18n is not loaded
        const fallbackTranslations = {
            'auth.invalid_credentials': 'Invalid email or password. Please try again or create an account.',
            'auth.password_mismatch': 'Passwords do not match.',
            'auth.password_too_short': 'Password must be at least 6 characters long.',
            'auth.email_exists': 'An account with this email already exists. Please login.',
            'auth.account_created': 'Account created successfully! Please login.',
            'auth.login_required': 'Please login to access this page.',
            'notification.welcome_back': 'Welcome back, {name}!',
            'notification.logged_out': 'You have been logged out.'
        };
        
        let translation = fallbackTranslations[key] || key;
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }

    showLoginError(message) {
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = this.t(`auth.${message}`) || message;
        errorElement.style.display = 'block';
    }

    showSignupError(message) {
        const errorElement = document.getElementById('signup-error');
        errorElement.textContent = this.t(`auth.${message}`) || message;
        errorElement.style.display = 'block';
    }

    showSignupSuccess(message) {
        const successElement = document.getElementById('signup-success');
        successElement.textContent = this.t(`auth.${message}`) || message;
        successElement.style.display = 'block';
    }

    showNotification(message, params = {}) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = this.t(`notification.${message}`, params) || message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    generateUserId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveUsers() {
        localStorage.setItem('travl_users', JSON.stringify(this.users));
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});