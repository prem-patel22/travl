// Advanced Date Picker with Availability
class TravelDatePicker {
    constructor(inputId, options = {}) {
        this.input = document.getElementById(inputId);
        this.options = {
            minDate: new Date(),
            maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            unavailableDates: [],
            ...options
        };
        
        this.init();
    }

    init() {
        this.createDatePicker();
        this.setupEventListeners();
        this.loadAvailabilityData();
    }

    createDatePicker() {
        // Create date picker container
        this.picker = document.createElement('div');
        this.picker.className = 'travel-datepicker';
        this.picker.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: none;
            padding: 1rem;
        `;

        // Create calendar structure
        this.picker.innerHTML = `
            <div class="datepicker-header">
                <button class="nav-btn prev-month"><i class="fas fa-chevron-left"></i></button>
                <h4 class="current-month"></h4>
                <button class="nav-btn next-month"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="datepicker-weekdays">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div class="datepicker-dates"></div>
            <div class="datepicker-availability">
                <div class="availability-legend">
                    <span class="available"><i class="fas fa-circle"></i> Available</span>
                    <span class="unavailable"><i class="fas fa-circle"></i> Unavailable</span>
                    <span class="selected"><i class="fas fa-circle"></i> Selected</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.picker);
    }

    setupEventListeners() {
        // Show/hide picker
        this.input.addEventListener('focus', () => this.showPicker());
        this.input.addEventListener('click', () => this.showPicker());

        // Navigation
        this.picker.querySelector('.prev-month').addEventListener('click', () => this.previousMonth());
        this.picker.querySelector('.next-month').addEventListener('click', () => this.nextMonth());

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.picker.contains(e.target) && e.target !== this.input) {
                this.hidePicker();
            }
        });
    }

    showPicker() {
        this.picker.style.display = 'block';
        this.renderCalendar(new Date());
        this.positionPicker();
    }

    hidePicker() {
        this.picker.style.display = 'none';
    }

    positionPicker() {
        const rect = this.input.getBoundingClientRect();
        this.picker.style.top = `${rect.bottom + window.scrollY}px`;
        this.picker.style.left = `${rect.left + window.scrollX}px`;
    }

    renderCalendar(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Update header
        this.picker.querySelector('.current-month').textContent = 
            date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        
        // Create dates grid
        const datesContainer = this.picker.querySelector('.datepicker-dates');
        datesContainer.innerHTML = '';

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            datesContainer.appendChild(this.createDateCell(''));
        }

        // Add date cells
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const cell = this.createDateCell(day, dateObj);
            datesContainer.appendChild(cell);
        }
    }

    createDateCell(day, dateObj = null) {
        const cell = document.createElement('div');
        cell.className = 'date-cell';
        
        if (!dateObj) {
            cell.classList.add('empty');
            return cell;
        }

        cell.textContent = day;
        cell.setAttribute('data-date', dateObj.toISOString().split('T')[0]);

        // Check availability
        if (this.isDateUnavailable(dateObj)) {
            cell.classList.add('unavailable');
        } else if (this.isDateSelected(dateObj)) {
            cell.classList.add('selected');
        } else {
            cell.classList.add('available');
        }

        // Add click handler for available dates
        if (!this.isDateUnavailable(dateObj)) {
            cell.addEventListener('click', () => this.selectDate(dateObj));
        }

        return cell;
    }

    isDateUnavailable(date) {
        return this.options.unavailableDates.some(unavailableDate =>
            unavailableDate.getTime() === date.getTime()
        );
    }

    isDateSelected(date) {
        const selectedDate = new Date(this.input.value);
        return selectedDate && selectedDate.getTime() === date.getTime();
    }

    selectDate(date) {
        this.input.value = date.toISOString().split('T')[0];
        this.hidePicker();
        
        // Trigger change event
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    previousMonth() {
        const currentMonth = this.picker.querySelector('.current-month').textContent;
        const date = new Date(currentMonth + ' 1');
        date.setMonth(date.getMonth() - 1);
        this.renderCalendar(date);
    }

    nextMonth() {
        const currentMonth = this.picker.querySelector('.current-month').textContent;
        const date = new Date(currentMonth + ' 1');
        date.setMonth(date.getMonth() + 1);
        this.renderCalendar(date);
    }

    loadAvailabilityData() {
        // Simulate loading availability data from API
        setTimeout(() => {
            // Mark some random dates as unavailable for demo
            const unavailableDates = [];
            const today = new Date();
            
            for (let i = 0; i < 10; i++) {
                const randomDate = new Date(today);
                randomDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
                unavailableDates.push(randomDate);
            }
            
            this.options.unavailableDates = unavailableDates;
        }, 1000);
    }

    // Method to update availability
    updateAvailability(dates) {
        this.options.unavailableDates = dates;
        if (this.picker.style.display !== 'none') {
            this.renderCalendar(new Date(this.picker.querySelector('.current-month').textContent + ' 1'));
        }
    }
}

// Initialize date pickers
document.addEventListener('DOMContentLoaded', () => {
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    
    if (checkinInput) {
        window.checkinDatePicker = new TravelDatePicker('checkin-date');
    }
    if (checkoutInput) {
        window.checkoutDatePicker = new TravelDatePicker('checkout-date');
    }
});