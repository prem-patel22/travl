// Booking Confirmation Page
class BookingConfirmation {
    constructor() {
        this.booking = null;
        this.init();
    }

    init() {
        this.loadBookingData();
        this.renderConfirmation();
        this.setupEventListeners();
    }

    loadBookingData() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');

        // In a real app, this would be an API call
        // For demo, we'll get from user's bookings or localStorage
        this.booking = this.getBookingById(bookingId);
        
        if (!this.booking) {
            this.showError('Booking not found');
            return;
        }
    }

    getBookingById(bookingId) {
        const currentUser = window.authSystem?.getCurrentUser();
        if (currentUser && currentUser.bookings) {
            return currentUser.bookings.find(booking => booking.id === bookingId);
        }

        // Fallback to localStorage for demo
        const demoBookings = JSON.parse(localStorage.getItem('travl_demo_bookings')) || [];
        return demoBookings.find(booking => booking.id === bookingId);
    }

    renderConfirmation() {
        if (!this.booking) return;

        // Update booking ID
        document.getElementById('confirmation-booking-id').textContent = this.booking.id;

        // Update destination
        document.getElementById('confirmation-destination').textContent = this.booking.destination.name;

        // Update dates
        const checkin = new Date(this.booking.checkin).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        const checkout = new Date(this.booking.checkout).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        document.getElementById('confirmation-dates').textContent = `${checkin} - ${checkout}`;

        // Update travelers
        document.getElementById('confirmation-travelers').textContent = 
            `${this.booking.travelers} ${this.booking.travelers === 1 ? 'Traveler' : 'Travelers'}`;

        // Update total
        document.getElementById('confirmation-total').textContent = 
            `$${this.booking.totalPrice.toFixed(2)}`;

        // Render guests
        this.renderGuests();

        // Update payment details
        this.renderPaymentDetails();
    }

    renderGuests() {
        const guestsContainer = document.getElementById('confirmation-guests');
        if (!guestsContainer || !this.booking.guests) return;

        guestsContainer.innerHTML = this.booking.guests.map(guest => `
            <div class="guest-item">
                <div class="guest-avatar">
                    ${this.getUserInitials(guest.firstName + ' ' + guest.lastName)}
                </div>
                <div class="guest-info">
                    <h4>${guest.firstName} ${guest.lastName}</h4>
                    <p>${guest.email}</p>
                    ${guest.phone ? `<p>${guest.phone}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    getUserInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    renderPaymentDetails() {
        // These would typically come from the payment system
        document.getElementById('confirmation-payment-method').textContent = 'Credit Card';
        document.getElementById('confirmation-transaction').textContent = 'txn_' + Math.random().toString(36).substr(2, 10);
        document.getElementById('confirmation-payment-date').textContent = 
            new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
    }

    setupEventListeners() {
        // Print functionality
        const printButton = document.querySelector('button[onclick="window.print()"]');
        if (printButton) {
            printButton.addEventListener('click', () => {
                window.print();
            });
        }

        // Email confirmation (simulated)
        this.sendConfirmationEmail();
    }

    sendConfirmationEmail() {
        // In a real app, this would call your backend API
        console.log('Sending confirmation email for booking:', this.booking.id);
        
        // Simulate email sending
        setTimeout(() => {
            console.log('Confirmation email sent successfully');
        }, 2000);
    }

    showError(message) {
        const header = document.querySelector('.confirmation-header');
        header.className = 'confirmation-header error';
        header.innerHTML = `
            <div class="confirmation-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h1>Booking Not Found</h1>
            <p>${message}</p>
            <a href="bookings.html" class="btn-primary">View My Bookings</a>
        `;
    }
}

// Initialize confirmation page
document.addEventListener('DOMContentLoaded', () => {
    new BookingConfirmation();
});