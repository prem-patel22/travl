// Admin Bookings Management
class AdminBookings {
    constructor() {
        this.bookings = [];
        this.filters = {};
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.loadBookings();
        this.setupEventListeners();
    }

    async loadBookings() {
        this.bookings = await this.fetchBookings();
        this.renderBookings();
    }

    renderBookings() {
        const container = document.getElementById('bookings-table');
        container.innerHTML = this.bookings.map(booking => `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.customerName}<br><small>${booking.customerEmail}</small></td>
                <td>${booking.destination}</td>
                <td>${booking.checkin} to ${booking.checkout}</td>
                <td>$${booking.amount}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-booking" data-id="${booking.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-booking" data-id="${booking.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-booking" data-id="${booking.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}