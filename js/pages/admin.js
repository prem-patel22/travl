// Admin Dashboard
class AdminDashboard {
    constructor() {
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.loadDashboardData();
        this.setupCharts();
        this.setupEventListeners();
    }

    checkAdminAccess() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = '../../index.html';
            return;
        }
    }

    async loadDashboardData() {
        try {
            // Load stats
            this.stats = await this.fetchDashboardStats();
            this.updateStatsDisplay();
            
            // Load recent bookings
            await this.loadRecentBookings();
            
            // Load top destinations
            await this.loadTopDestinations();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchDashboardStats() {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    revenue: 24568,
                    bookings: 1247,
                    users: 5892,
                    destinations: 156,
                    revenueChange: 12.5,
                    bookingsChange: 8.3,
                    usersChange: 5.2,
                    destinationsChange: 3.1
                });
            }, 1000);
        });
    }

    updateStatsDisplay() {
        // Update revenue
        document.querySelector('.stat-card:nth-child(1) h3').textContent = 
            `$${this.stats.revenue.toLocaleString()}`;
        document.querySelector('.stat-card:nth-child(1) .stat-change').textContent = 
            `+${this.stats.revenueChange}%`;

        // Update bookings
        document.querySelector('.stat-card:nth-child(2) h3').textContent = 
            this.stats.bookings.toLocaleString();
        document.querySelector('.stat-card:nth-child(2) .stat-change').textContent = 
            `+${this.stats.bookingsChange}%`;

        // Update users
        document.querySelector('.stat-card:nth-child(3) h3').textContent = 
            this.stats.users.toLocaleString();
        document.querySelector('.stat-card:nth-child(3) .stat-change').textContent = 
            `+${this.stats.usersChange}%`;

        // Update destinations
        document.querySelector('.stat-card:nth-child(4) h3').textContent = 
            this.stats.destinations.toLocaleString();
        document.querySelector('.stat-card:nth-child(4) .stat-change').textContent = 
            `+${this.stats.destinationsChange}%`;
    }

    async loadRecentBookings() {
        const bookings = await this.fetchRecentBookings();
        const container = document.getElementById('recent-bookings');
        
        if (!container) return;

        container.innerHTML = bookings.map(booking => `
            <tr>
                <td>
                    <a href="bookings.html?id=${booking.id}" class="booking-id">
                        ${booking.id}
                    </a>
                </td>
                <td>
                    <div class="user-info">
                        <strong>${booking.customerName}</strong>
                        <div class="user-email">${booking.customerEmail}</div>
                    </div>
                </td>
                <td>${booking.destination}</td>
                <td>$${booking.amount}</td>
                <td>
                    <span class="status-badge status-${booking.status}">
                        ${booking.status}
                    </span>
                </td>
                <td>${this.formatDate(booking.date)}</td>
            </tr>
        `).join('');
    }

    async fetchRecentBookings() {
        return [
            {
                id: 'TRV20240115001',
                customerName: 'John Smith',
                customerEmail: 'john.smith@email.com',
                destination: 'Bali, Indonesia',
                amount: 1899,
                status: 'confirmed',
                date: '2024-01-15'
            },
            {
                id: 'TRV20240114002',
                customerName: 'Sarah Johnson',
                customerEmail: 'sarah.j@email.com',
                destination: 'Paris, France',
                amount: 2199,
                status: 'pending',
                date: '2024-01-14'
            },
            {
                id: 'TRV20240113003',
                customerName: 'Mike Chen',
                customerEmail: 'mike.chen@email.com',
                destination: 'Tokyo, Japan',
                amount: 2499,
                status: 'confirmed',
                date: '2024-01-13'
            },
            {
                id: 'TRV20240112004',
                customerName: 'Emma Davis',
                customerEmail: 'emma.d@email.com',
                destination: 'New York, USA',
                amount: 1599,
                status: 'cancelled',
                date: '2024-01-12'
            },
            {
                id: 'TRV20240111005',
                customerName: 'Alex Wilson',
                customerEmail: 'alex.w@email.com',
                destination: 'Sydney, Australia',
                amount: 1999,
                status: 'confirmed',
                date: '2024-01-11'
            }
        ];
    }

    async loadTopDestinations() {
        const destinations = await this.fetchTopDestinations();
        const container = document.getElementById('top-destinations');
        
        if (!container) return;

        container.innerHTML = destinations.map(dest => `
            <div class="destination-item">
                <div class="destination-image">
                    <img src="${dest.image}" alt="${dest.name}">
                </div>
                <div class="destination-info">
                    <h4>${dest.name}</h4>
                    <div class="destination-meta">
                        <span><i class="fas fa-star"></i> ${dest.rating}</span>
                        <span><i class="fas fa-suitcase"></i> ${dest.bookings} bookings</span>
                        <span><i class="fas fa-dollar-sign"></i> $${dest.revenue}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async fetchTopDestinations() {
        return [
            {
                name: 'Bali, Indonesia',
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 4.8,
                bookings: 247,
                revenue: '468,520'
            },
            {
                name: 'Paris, France',
                image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 4.9,
                bookings: 189,
                revenue: '412,350'
            },
            {
                name: 'Tokyo, Japan',
                image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 4.7,
                bookings: 156,
                revenue: '389,120'
            },
            {
                name: 'New York, USA',
                image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 4.6,
                bookings: 134,
                revenue: '321,890'
            }
        ];
    }

    setupCharts() {
        this.setupRevenueChart();
        this.setupSourcesChart();
    }

    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    setupSourcesChart() {
        const ctx = document.getElementById('sourcesChart').getContext('2d');
        
        this.sourcesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Social Media', 'Search Engines', 'Email', 'Referral'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#2563eb',
                        '#8b5cf6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }

    setupEventListeners() {
        // Period selector
        const periodSelect = document.querySelector('.chart-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.value);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    updateRevenueChart(period) {
        // Simulate data update based on period
        const dataMap = {
            'Last 7 days': [28000, 30000, 32000, 31000, 33000, 35000, 36000],
            'Last 30 days': Array(30).fill(0).map(() => Math.floor(Math.random() * 40000) + 20000),
            'Last 90 days': Array(90).fill(0).map(() => Math.floor(Math.random() * 40000) + 20000)
        };

        this.revenueChart.data.datasets[0].data = dataMap[period] || dataMap['Last 7 days'];
        this.revenueChart.update();
    }

    handleLogout() {
        if (window.authSystem) {
            window.authSystem.logout();
        }
        window.location.href = '../../index.html';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});