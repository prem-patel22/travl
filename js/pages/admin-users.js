// Admin Users Management
class AdminUsers {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.filters = {
            search: '',
            type: 'all',
            status: 'all',
            registration: 'all'
        };
        this.currentPage = 1;
        this.usersPerPage = 10;
        this.selectedUsers = new Set();
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.loadUsers();
        this.setupEventListeners();
        this.setupSearch();
    }

    async loadUsers() {
        try {
            this.users = await this.fetchUsers();
            this.applyFilters();
            this.updateStats();
            this.renderUsers();
            this.setupPagination();
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError('Failed to load users data');
        }
    }

    async fetchUsers() {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = [];
                const names = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa', 'David', 'Maria'];
                const lastNames = ['Smith', 'Johnson', 'Chen', 'Davis', 'Wilson', 'Brown', 'Taylor', 'Garcia'];
                
                for (let i = 1; i <= 100; i++) {
                    const firstName = names[Math.floor(Math.random() * names.length)];
                    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const types = ['customer', 'customer', 'customer', 'premium', 'admin'];
                    const statuses = ['active', 'active', 'active', 'inactive', 'suspended'];
                    
                    users.push({
                        id: `user_${i}`,
                        firstName: firstName,
                        lastName: lastName,
                        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                        type: types[Math.floor(Math.random() * types.length)],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        bookings: Math.floor(Math.random() * 50),
                        joined: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                        phone: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
                        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80&${i}`
                    });
                }
                resolve(users);
            }, 1000);
        });
    }

    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                if (!fullName.includes(searchTerm) && !user.email.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Type filter
            if (this.filters.type !== 'all' && user.type !== this.filters.type) {
                return false;
            }
            
            // Status filter
            if (this.filters.status !== 'all' && user.status !== this.filters.status) {
                return false;
            }
            
            // Registration date filter
            if (this.filters.registration !== 'all') {
                const joinedDate = new Date(user.joined);
                const now = new Date();
                
                switch (this.filters.registration) {
                    case 'today':
                        if (joinedDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                        if (joinedDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                        if (joinedDate < monthAgo) return false;
                        break;
                }
            }
            
            return true;
        });
        
        this.currentPage = 1; // Reset to first page when filters change
    }

    updateStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const newUsers = this.users.filter(u => {
            const joinedDate = new Date(u.joined);
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return joinedDate > monthAgo;
        }).length;
        const premiumUsers = this.users.filter(u => u.type === 'premium').length;

        document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        document.getElementById('active-users').textContent = activeUsers.toLocaleString();
        document.getElementById('new-users').textContent = newUsers.toLocaleString();
        document.getElementById('premium-users').textContent = premiumUsers.toLocaleString();
    }

    renderUsers() {
        const container = document.getElementById('users-table');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.usersPerPage;
        const endIndex = startIndex + this.usersPerPage;
        const usersToShow = this.filteredUsers.slice(startIndex, endIndex);

        if (usersToShow.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">
                        <i class="fas fa-users"></i>
                        <p>No users found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = usersToShow.map(user => `
            <tr data-user-id="${user.id}">
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}" 
                           ${this.selectedUsers.has(user.id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="user-info-cell">
                        <img src="${user.avatar}" alt="${user.firstName}" class="user-avatar-small">
                        <div>
                            <strong>${user.firstName} ${user.lastName}</strong>
                            <div class="user-id">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="user-type-badge type-${user.type}">
                        ${user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                </td>
                <td>
                    <span class="user-status-badge status-${user.status}">
                        ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                </td>
                <td>${user.bookings}</td>
                <td>${this.formatDate(user.joined)}</td>
                <td>${this.formatDate(user.lastActive)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-user" data-id="${user.id}" title="View Profile">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-user" data-id="${user.id}" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-user" data-id="${user.id}" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupPagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.usersPerPage);
        const pagesContainer = document.getElementById('pagination-pages');
        
        if (!pagesContainer) return;

        pagesContainer.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            pagesContainer.appendChild(pageBtn);
        }

        // Update prev/next buttons
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderUsers();
        this.setupPagination();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('apply-filters').addEventListener('click', () => this.handleFilterApply());
        document.getElementById('reset-filters').addEventListener('click', () => this.handleFilterReset());
        
        // User type filter
        document.getElementById('user-type-filter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
        });
        
        // Status filter
        document.getElementById('user-status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
        });
        
        // Registration filter
        document.getElementById('registration-filter').addEventListener('change', (e) => {
            this.filters.registration = e.target.value;
        });

        // Add user button
        document.getElementById('add-user-btn').addEventListener('click', () => this.showUserModal());

        // Select all checkbox
        document.getElementById('select-all').addEventListener('change', (e) => {
            this.handleSelectAll(e.target.checked);
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('next-page').addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // Export users
        document.getElementById('export-users').addEventListener('click', () => this.exportUsers());

        // User modal
        document.getElementById('cancel-user').addEventListener('click', () => this.hideUserModal());
        document.getElementById('user-form').addEventListener('submit', (e) => this.handleUserSubmit(e));

        // Close modal
        document.querySelector('.close-modal').addEventListener('click', () => this.hideUserModal());
    }

    setupSearch() {
        const searchInput = document.getElementById('user-search');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.applyFilters();
                this.renderUsers();
                this.setupPagination();
            }, 300);
        });
    }

    handleFilterApply() {
        this.applyFilters();
        this.renderUsers();
        this.setupPagination();
    }

    handleFilterReset() {
        this.filters = {
            search: '',
            type: 'all',
            status: 'all',
            registration: 'all'
        };
        
        // Reset form elements
        document.getElementById('user-search').value = '';
        document.getElementById('user-type-filter').value = 'all';
        document.getElementById('user-status-filter').value = 'all';
        document.getElementById('registration-filter').value = 'all';
        
        this.applyFilters();
        this.renderUsers();
        this.setupPagination();
    }

    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedUsers.add(checkbox.value);
            } else {
                this.selectedUsers.delete(checkbox.value);
            }
        });
    }

    showUserModal(userId = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        if (userId) {
            // Edit mode
            title.textContent = 'Edit User';
            const user = this.users.find(u => u.id === userId);
            if (user) {
                this.populateUserForm(user);
            }
        } else {
            // Add mode
            title.textContent = 'Add User';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    hideUserModal() {
        document.getElementById('user-modal').style.display = 'none';
    }

    populateUserForm(user) {
        document.getElementById('user-firstname').value = user.firstName;
        document.getElementById('user-lastname').value = user.lastName;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-type').value = user.type;
        document.getElementById('user-status').value = user.status;
        document.getElementById('user-phone').value = user.phone || '';
    }

    async handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstname'),
            lastName: formData.get('lastname'),
            email: formData.get('email'),
            type: formData.get('type'),
            status: formData.get('status'),
            phone: formData.get('phone')
        };

        try {
            // Simulate API call
            await this.saveUser(userData);
            this.showSuccess('User saved successfully');
            this.hideUserModal();
            this.loadUsers(); // Reload users
        } catch (error) {
            this.showError('Failed to save user');
        }
    }

    async saveUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate saving user
                console.log('Saving user:', userData);
                resolve();
            }, 1000);
        });
    }

    async exportUsers() {
        try {
            const csvContent = this.generateCSV();
            this.downloadCSV(csvContent, 'travl-users.csv');
            this.showSuccess('Users exported successfully');
        } catch (error) {
            this.showError('Failed to export users');
        }
    }

    generateCSV() {
        const headers = ['Name', 'Email', 'Type', 'Status', 'Bookings', 'Joined', 'Last Active'];
        const rows = this.filteredUsers.map(user => [
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.type,
            user.status,
            user.bookings,
            this.formatDate(user.joined),
            this.formatDate(user.lastActive)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    checkAdminAccess() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = '../../index.html';
            return;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize admin users
document.addEventListener('DOMContentLoaded', () => {
    new AdminUsers();
});