// Bookings page functionality
class BookingsPage {
    constructor() {
        this.bookings = [];
        this.currentTab = 'upcoming';
        
        this.init();
    }

    init() {
        if (!requireAuth()) return;
        
        this.loadBookings();
        this.setupEventListeners();
        this.renderBookings();
    }

    loadBookings() {
        const currentUser = window.authSystem.getCurrentUser();
        this.bookings = currentUser?.bookings || [];
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });

        // Booking actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cancel')) {
                this.cancelBooking(e.target.getAttribute('data-booking-id'));
            }
            if (e.target.classList.contains('btn-view')) {
                this.viewBooking(e.target.getAttribute('data-booking-id'));
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.renderBookings();
    }

    renderBookings() {
        const filteredBookings = this.getFilteredBookings();
        
        // Show/hide empty state
        const noBookingsElement = document.getElementById('no-bookings');
        if (filteredBookings.length === 0) {
            noBookingsElement.style.display = 'block';
        } else {
            noBookingsElement.style.display = 'none';
        }
        
        // Render bookings for current tab
        const bookingsList = document.getElementById(`${this.currentTab}-bookings`);
        bookingsList.innerHTML = filteredBookings.map(booking => this.createBookingHTML(booking)).join('');
    }

    getFilteredBookings() {
        const now = new Date();
        
        switch (this.currentTab) {
            case 'upcoming':
                return this.bookings.filter(booking => 
                    new Date(booking.departureDate) > now && booking.status === 'confirmed'
                );
            case 'past':
                return this.bookings.filter(booking => 
                    new Date(booking.returnDate) < now && booking.status === 'confirmed'
                );
            case 'cancelled':
                return this.bookings.filter(booking => booking.status === 'cancelled');
            default:
                return [];
        }
    }

    createBookingHTML(booking) {
        const statusClass = `status-${booking.status}`;
        const formattedPrice = window.travlUtils.formatCurrency(booking.totalPrice);
        const departureDate = window.travlUtils.formatDate(booking.departureDate);
        const returnDate = window.travlUtils.formatDate(booking.returnDate);
        
        return `
            <div class="booking-item">
                <div class="booking-header">
                    <h3 class="booking-title">${booking.destination}</h3>
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                
                <div class="booking-details">
                    <div class="booking-location">
                        <h4>Departure</h4>
                        <p>${booking.origin}</p>
                    </div>
                    
                    <div class="booking-route">
                        <i class="fas fa-plane"></i>
                    </div>
                    
                    <div class="booking-location">
                        <h4>Arrival</h4>
                        <p>${booking.destination}</p>
                    </div>
                </div>
                
                <div class="booking-date">
                    <strong>${departureDate} - ${returnDate}</strong>
                </div>
                
                <div class="booking-meta">
                    <div class="booking-price">${formattedPrice}</div>
                    <div class="booking-actions">
                        ${this.currentTab === 'upcoming' ? `
                            <button class="btn-secondary btn-view" data-booking-id="${booking.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-outline btn-cancel" data-booking-id="${booking.id}">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : `
                            <button class="btn-secondary btn-view" data-booking-id="${booking.id}">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    viewBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            // In a real app, this would show a detailed booking modal or page
            alert(`Booking Details:\n\nDestination: ${booking.destination}\nDates: ${window.travlUtils.formatDate(booking.departureDate)} - ${window.travlUtils.formatDate(booking.returnDate)}\nStatus: ${booking.status}\nTotal: ${window.travlUtils.formatCurrency(booking.totalPrice)}`);
        }
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                this.bookings[bookingIndex].status = 'cancelled';
                this.saveBookings();
                this.renderBookings();
                
                // Show success message
                this.showNotification('Booking cancelled successfully');
            }
        }
    }

    saveBookings() {
        const currentUser = window.authSystem.getCurrentUser();
        if (currentUser) {
            currentUser.bookings = this.bookings;
            window.authSystem.saveUsers();
            
            // Update localStorage
            const users = JSON.parse(localStorage.getItem('travl_users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('travl_users', JSON.stringify(users));
            }
        }
    }

    showNotification(message) {
        // Create notification
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

    // Sample method to add a booking (for demonstration)
    addSampleBooking() {
        const sampleBooking = {
            id: 'booking_' + Date.now(),
            destination: 'Bali, Indonesia',
            origin: 'New York, USA',
            departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            totalPrice: 1899,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        this.bookings.push(sampleBooking);
        this.saveBookings();
        this.renderBookings();
    }
}

// Initialize bookings page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookingsPage();
});