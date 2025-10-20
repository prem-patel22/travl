// Utility functions
class StorageManager {
    static setItem(key, value) {
        localStorage.setItem(`travl_${key}`, JSON.stringify(value));
    }

    static getItem(key) {
        const item = localStorage.getItem(`travl_${key}`);
        return item ? JSON.parse(item) : null;
    }

    static removeItem(key) {
        localStorage.removeItem(`travl_${key}`);
    }

    static clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('travl_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

class AuthManager {
    static isAuthenticated() {
        return !!StorageManager.getItem('current_user');
    }

    static getCurrentUser() {
        return StorageManager.getItem('current_user');
    }

    static login(userData) {
        StorageManager.setItem('current_user', userData);
    }

    static logout() {
        StorageManager.removeItem('current_user');
        StorageManager.removeItem('current_trip');
        StorageManager.removeItem('theme');
        window.location.href = 'index.html';
    }

    static validateUser(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('travl_users') || '[]');
            const user = users.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            return user ? { id: user.id, name: user.name, email: user.email } : null;
        } catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }

    static userExists(email) {
        try {
            const users = JSON.parse(localStorage.getItem('travl_users') || '[]');
            return users.some(u => u.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }

    static registerUser(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('travl_users') || '[]');

            if (this.userExists(userData.email)) {
                return null;
            }

            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email.toLowerCase(),
                password: userData.password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('travl_users', JSON.stringify(users));

            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error registering user:', error);
            return null;
        }
    }

    static initializeUsers() {
        if (!localStorage.getItem('travl_users')) {
            localStorage.setItem('travl_users', JSON.stringify([]));
            console.log('Initialized empty users storage');
        }
    }
}

class CurrencyFormatter {
    static formatUSD(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static parseUSD(amountString) {
        return parseFloat(amountString.replace(/[^\d.-]/g, ''));
    }
}

// Route protection
function protectRoute() {
    if (!AuthManager.isAuthenticated()) {
        window.location.href = 'auth.html?action=login';
        return false;
    }
    return true;
}

// Theme management
function initializeTheme() {
    const savedTheme = StorageManager.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    StorageManager.setItem('theme', newTheme);
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}
