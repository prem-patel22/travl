// Profile page functionality
class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'personal';
        
        this.init();
    }

    init() {
        if (!requireAuth()) return;
        
        this.currentUser = window.authSystem.getCurrentUser();
        this.setupEventListeners();
        this.loadProfileData();
        this.setupTabNavigation();
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('personal-form').addEventListener('submit', (e) => this.handlePersonalInfoSubmit(e));
        document.getElementById('security-form').addEventListener('submit', (e) => this.handleSecuritySubmit(e));
        document.getElementById('preferences-form').addEventListener('submit', (e) => this.handlePreferencesSubmit(e));
        document.getElementById('notifications-form').addEventListener('submit', (e) => this.handleNotificationsSubmit(e));
    }

    setupTabNavigation() {
        // Tab navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchTab(target);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${tabName}"]`).classList.add('active');
        
        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    loadProfileData() {
        this.updateProfileDisplay();
        this.populateForms();
        this.calculateStats();
    }

    updateProfileDisplay() {
        // Update avatar
        const avatar = document.getElementById('profile-avatar');
        const initials = this.getInitials(this.currentUser.name);
        avatar.textContent = initials;
        
        // Update name and email
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-email').textContent = this.currentUser.email;
    }

    getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    populateForms() {
        // Personal info form
        const nameParts = this.currentUser.name.split(' ');
        document.getElementById('first-name').value = nameParts[0] || '';
        document.getElementById('last-name').value = nameParts.slice(1).join(' ') || '';
        document.getElementById('email').value = this.currentUser.email || '';
        
        // Populate other fields from user data if available
        if (this.currentUser.phone) {
            document.getElementById('phone').value = this.currentUser.phone;
        }
        if (this.currentUser.birthdate) {
            document.getElementById('birthdate').value = this.currentUser.birthdate;
        }
        
        // Preferences
        if (this.currentUser.preferences) {
            if (this.currentUser.preferences.travelStyle) {
                this.currentUser.preferences.travelStyle.forEach(style => {
                    const checkbox = document.getElementById(`style-${style}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            if (this.currentUser.preferences.currency) {
                document.getElementById('currency').value = this.currentUser.preferences.currency;
            }
        }
        
        // Notifications
        if (this.currentUser.notifications) {
            document.getElementById('notif-promotions').checked = this.currentUser.notifications.promotions !== false;
            document.getElementById('notif-bookings').checked = this.currentUser.notifications.bookings !== false;
            document.getElementById('notif-reminders').checked = this.currentUser.notifications.reminders !== false;
        }
    }

    calculateStats() {
        const bookings = this.currentUser.bookings || [];
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        
        // Calculate stats
        const trips = confirmedBookings.length;
        const countries = new Set(confirmedBookings.map(b => b.destination)).size;
        const days = confirmedBookings.reduce((total, booking) => {
            const departure = new Date(booking.departureDate);
            const returnDate = new Date(booking.returnDate);
            const duration = Math.ceil((returnDate - departure) / (1000 * 60 * 60 * 24));
            return total + duration;
        }, 0);
        
        // Update stats display
        document.getElementById('stat-trips').textContent = trips;
        document.getElementById('stat-countries').textContent = countries;
        document.getElementById('stat-days').textContent = days;
    }

    handlePersonalInfoSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Update user data
        this.currentUser.name = `${formData.get('firstName')} ${formData.get('lastName')}`.trim();
        this.currentUser.email = formData.get('email');
        this.currentUser.phone = formData.get('phone');
        this.currentUser.birthdate = formData.get('birthdate');
        
        this.saveUserData();
        this.updateProfileDisplay();
        this.showSuccess('Personal information updated successfully');
    }

    handleSecuritySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate current password
        if (currentPassword !== this.currentUser.password) {
            this.showError('Current password is incorrect');
            return;
        }
        
        // Validate new password
        if (newPassword.length < 6) {
            this.showError('New password must be at least 6 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('New passwords do not match');
            return;
        }
        
        // Update password
        this.currentUser.password = newPassword;
        this.saveUserData();
        this.showSuccess('Password updated successfully');
        e.target.reset();
    }

    handlePreferencesSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Get travel styles
        const travelStyles = [];
        formData.getAll('travelStyle').forEach(style => {
            travelStyles.push(style);
        });
        
        // Update preferences
        this.currentUser.preferences = {
            ...this.currentUser.preferences,
            travelStyle: travelStyles,
            currency: formData.get('currency')
        };
        
        this.saveUserData();
        this.showSuccess('Preferences updated successfully');
    }

    handleNotificationsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Update notifications
        this.currentUser.notifications = {
            promotions: formData.get('promotions') === 'on',
            bookings: formData.get('bookings') === 'on',
            reminders: formData.get('reminders') === 'on'
        };
        
        this.saveUserData();
        this.showSuccess('Notification settings updated successfully');
    }

    saveUserData() {
        // Update in auth system
        window.authSystem.currentUser = this.currentUser;
        localStorage.setItem('travl_current_user', JSON.stringify(this.currentUser));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('travl_users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('travl_users', JSON.stringify(users));
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-color)' : '#dc2626'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});