// Complete Booking System - Enhanced with Real Payments
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.bookingData = {
            destination: null,
            checkin: null,
            checkout: null,
            travelers: 1,
            guests: [],
            payment: null,
            totalPrice: 0,
            bookingId: null
        };
        
        this.init();
    }

    init() {
        this.loadBookingData();
        this.setupEventListeners();
        this.renderBookingSteps();
        this.showStep(1);
    }

    loadBookingData() {
        // Load from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        
        this.bookingData.destination = {
            id: urlParams.get('destinationId'),
            name: urlParams.get('destination'),
            price: parseInt(urlParams.get('price')) || 0,
            image: urlParams.get('image')
        };

        this.bookingData.checkin = urlParams.get('checkin');
        this.bookingData.checkout = urlParams.get('checkout');
        this.bookingData.travelers = parseInt(urlParams.get('travelers')) || 1;

        // Calculate total price
        this.calculateTotalPrice();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('btn-next-step')?.addEventListener('click', () => this.nextStep());
        document.getElementById('btn-prev-step')?.addEventListener('click', () => this.previousStep());

        // Guest form
        document.getElementById('guest-form')?.addEventListener('submit', (e) => this.handleGuestSubmit(e));

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Credit card form
        document.getElementById('payment-form')?.addEventListener('submit', (e) => this.handlePaymentSubmit(e));

        // Real-time validation
        this.setupRealTimeValidation();
    }

    renderBookingSteps() {
        const stepsContainer = document.querySelector('.booking-steps');
        if (!stepsContainer) return;
        
        stepsContainer.innerHTML = '';

        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.createElement('div');
            step.className = `step ${i === 1 ? 'active' : ''}`;
            step.innerHTML = `
                <div class="step-number">${i}</div>
                <div class="step-label">${this.getStepLabel(i)}</div>
            `;
            stepsContainer.appendChild(step);
        }
    }

    getStepLabel(stepNumber) {
        const labels = {
            1: 'Details',
            2: 'Guests',
            3: 'Payment',
            4: 'Confirmation'
        };
        return labels[stepNumber];
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStep = document.getElementById(`step-${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }

        // Update steps visualization
        this.updateStepsVisualization(stepNumber);

        // Update navigation buttons
        this.updateNavigationButtons(stepNumber);

        // Update booking summary
        this.updateBookingSummary();

        // Initialize payment methods if we're on payment step
        if (stepNumber === 3) {
            this.initializePaymentStep();
        }

        // Save current step
        this.currentStep = stepNumber;
    }

    initializePaymentStep() {
        // Mount Stripe card element if it exists
        if (window.paymentSystem && window.paymentSystem.mountCardElement) {
            window.paymentSystem.mountCardElement('stripe-card-element');
        }

        // Render PayPal button if it exists
        if (window.paymentSystem && window.paymentSystem.renderPayPalButton) {
            const paypalContainer = document.getElementById('paypal-button-container');
            if (paypalContainer) {
                window.paymentSystem.renderPayPalButton('paypal-button-container', {
                    totalAmount: this.bookingData.totalPrice,
                    bookingId: this.generateBookingId(),
                    customerEmail: this.bookingData.guests[0]?.email || ''
                });
            }
        }
    }

    updateStepsVisualization(stepNumber) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });
    }

    updateNavigationButtons(stepNumber) {
        const btnPrev = document.getElementById('btn-prev-step');
        const btnNext = document.getElementById('btn-next-step');

        if (!btnPrev || !btnNext) return;

        // Show/hide previous button
        if (stepNumber === 1) {
            btnPrev.style.display = 'none';
        } else {
            btnPrev.style.display = 'block';
        }

        // Update next button text
        if (stepNumber === this.totalSteps) {
            btnNext.innerHTML = '<i class="fas fa-check"></i> Complete Booking';
        } else {
            btnNext.innerHTML = '<i class="fas fa-arrow-right"></i> Next Step';
        }

        // Disable next button if current step is not valid
        btnNext.disabled = !this.isStepValid(stepNumber);
    }

    isStepValid(stepNumber) {
        switch (stepNumber) {
            case 1: // Details
                return this.bookingData.destination && 
                       this.bookingData.checkin && 
                       this.bookingData.checkout;
            case 2: // Guests
                return this.bookingData.guests.length > 0 && 
                       this.bookingData.guests.every(guest => this.isGuestValid(guest));
            case 3: // Payment
                return this.bookingData.payment !== null;
            default:
                return true;
        }
    }

    isGuestValid(guest) {
        return guest.firstName && 
               guest.lastName && 
               guest.email && 
               this.isValidEmail(guest.email);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.isStepValid(this.currentStep)) {
                this.showStep(this.currentStep + 1);
            } else {
                this.showStepError('Please complete all required fields before proceeding.');
            }
        } else {
            this.completeBooking();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    handleGuestSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const guest = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            specialRequests: formData.get('specialRequests')
        };

        // Validate guest data
        if (!this.isGuestValid(guest)) {
            this.showStepError('Please fill in all required guest information.');
            return;
        }

        this.bookingData.guests = [guest]; // For now, single guest
        this.nextStep();
    }

    selectPaymentMethod(e) {
        const method = e.currentTarget;
        const methodType = method.getAttribute('data-method');

        // Remove selection from all methods
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected');
        });

        // Add selection to clicked method
        method.classList.add('selected');

        // Store selected method
        this.bookingData.payment = {
            method: methodType,
            details: {}
        };

        // Show/hide payment forms
        this.togglePaymentForms(methodType);

        // Enable next button
        const btnNext = document.getElementById('btn-next-step');
        if (btnNext) {
            btnNext.disabled = false;
        }
    }

    togglePaymentForms(methodType) {
        // Hide all payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });

        // Show selected payment form
        const selectedForm = document.getElementById(`${methodType}-form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }

        // Initialize Stripe card element if credit card is selected
        if (methodType === 'credit-card' && window.paymentSystem) {
            setTimeout(() => {
                window.paymentSystem.mountCardElement('stripe-card-element');
            }, 100);
        }
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();
        
        if (!this.bookingData.payment) {
            this.showStepError('Please select a payment method.');
            return;
        }

        const method = this.bookingData.payment.method;

        try {
            this.showLoading(true);

            if (method === 'credit-card') {
                await this.processCreditCardPayment();
            } else if (method === 'paypal') {
                // PayPal is handled by the button, so just proceed
                this.nextStep();
                return;
            }

            this.nextStep();

        } catch (error) {
            this.showStepError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async processCreditCardPayment() {
        if (!window.paymentSystem) {
            throw new Error('Payment system not available');
        }

        const bookingDetails = {
            customerName: `${this.bookingData.guests[0].firstName} ${this.bookingData.guests[0].lastName}`,
            customerEmail: this.bookingData.guests[0].email,
            totalAmount: Math.round(this.bookingData.totalPrice * 100), // Convert to cents
            bookingId: this.generateBookingId()
        };

        const paymentResult = await window.paymentSystem.processCreditCardPayment(bookingDetails);

        if (!paymentResult.success) {
            throw new Error(paymentResult.error);
        }

        // Store payment result
        this.bookingData.payment.details = {
            transactionId: paymentResult.transactionId,
            paymentMethod: paymentResult.paymentMethod,
            status: 'succeeded'
        };

        return paymentResult;
    }

    validateCreditCard() {
        const details = this.bookingData.payment.details;
        
        // Basic validation
        if (!details.cardNumber || details.cardNumber.replace(/\s/g, '').length !== 16) {
            return false;
        }
        
        if (!details.cardHolder) {
            return false;
        }
        
        if (!details.expiryDate || !this.isValidExpiryDate(details.expiryDate)) {
            return false;
        }
        
        if (!details.cvv || details.cvv.length !== 3) {
            return false;
        }
        
        return true;
    }

    isValidExpiryDate(expiryDate) {
        const [month, year] = expiryDate.split('/');
        const now = new Date();
        const expiry = new Date(parseInt('20' + year), parseInt(month) - 1);
        
        return expiry > now;
    }

    async completeBooking() {
        // Show loading state
        this.showLoading(true);

        try {
            // If payment was already processed (e.g., PayPal), use existing result
            // Otherwise, process the booking
            const bookingResult = await this.processBooking();
            
            if (bookingResult.success) {
                this.bookingData.bookingId = bookingResult.bookingId;
                this.saveBookingToUser();
                this.redirectToConfirmation();
            } else {
                throw new Error(bookingResult.error || 'Booking failed');
            }
        } catch (error) {
            this.showStepError('Booking failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async processBooking() {
        // If payment was already processed, just create the booking
        if (this.bookingData.payment?.details?.transactionId) {
            return {
                success: true,
                bookingId: this.generateBookingId(),
                message: 'Booking confirmed successfully'
            };
        }

        // Otherwise, simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 2000));

        const paymentSuccess = Math.random() > 0.1; // 90% success rate

        if (paymentSuccess) {
            return {
                success: true,
                bookingId: this.generateBookingId(),
                message: 'Booking confirmed successfully'
            };
        } else {
            return {
                success: false,
                error: 'Payment processing failed'
            };
        }
    }

    generateBookingId() {
        return 'TRV' + Date.now().toString().slice(-8);
    }

    saveBookingToUser() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (currentUser) {
            const booking = {
                id: this.bookingData.bookingId,
                destination: this.bookingData.destination,
                checkin: this.bookingData.checkin,
                checkout: this.bookingData.checkout,
                travelers: this.bookingData.travelers,
                guests: this.bookingData.guests,
                totalPrice: this.bookingData.totalPrice,
                payment: this.bookingData.payment,
                status: 'confirmed',
                bookedAt: new Date().toISOString()
            };

            if (!currentUser.bookings) {
                currentUser.bookings = [];
            }

            currentUser.bookings.push(booking);
            window.authSystem.saveUsers();
        }
    }

    redirectToConfirmation() {
        window.location.href = `booking-confirmation.html?bookingId=${this.bookingData.bookingId}`;
    }

    calculateTotalPrice() {
        if (this.bookingData.destination && this.bookingData.checkin && this.bookingData.checkout) {
            const nights = this.calculateNights();
            const basePrice = this.bookingData.destination.price * nights;
            const taxes = basePrice * 0.1; // 10% tax
            const serviceFee = 25; // Fixed service fee
            
            this.bookingData.totalPrice = basePrice + taxes + serviceFee;
        }
    }

    calculateNights() {
        const checkin = new Date(this.bookingData.checkin);
        const checkout = new Date(this.bookingData.checkout);
        const diffTime = Math.abs(checkout - checkin);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    updateBookingSummary() {
        const summaryContainer = document.getElementById('booking-summary');
        if (!summaryContainer) return;

        const nights = this.calculateNights();
        const basePrice = this.bookingData.destination?.price * nights || 0;
        const taxes = basePrice * 0.1;
        const serviceFee = 25;

        summaryContainer.innerHTML = `
            <div class="summary-item">
                <span class="label">Destination</span>
                <span class="value">${this.bookingData.destination?.name || 'Not selected'}</span>
            </div>
            <div class="summary-item">
                <span class="label">Check-in</span>
                <span class="value">${this.bookingData.checkin || 'Not selected'}</span>
            </div>
            <div class="summary-item">
                <span class="label">Check-out</span>
                <span class="value">${this.bookingData.checkout || 'Not selected'}</span>
            </div>
            <div class="summary-item">
                <span class="label">Travelers</span>
                <span class="value">${this.bookingData.travelers}</span>
            </div>
            <div class="summary-item">
                <span class="label">${nights} nights × $${this.bookingData.destination?.price || 0}</span>
                <span class="value">$${basePrice}</span>
            </div>
            <div class="summary-item">
                <span class="label">Taxes</span>
                <span class="value">$${taxes.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="label">Service fee</span>
                <span class="value">$${serviceFee}</span>
            </div>
            <div class="summary-total">
                <span class="label">Total</span>
                <span class="value">$${this.bookingData.totalPrice.toFixed(2)}</span>
            </div>
        `;
    }

    setupRealTimeValidation() {
        // Real-time credit card number formatting
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let matches = value.match(/\d{4,16}/g);
                let match = matches && matches[0] || '';
                let parts = [];
                
                for (let i = 0; i < match.length; i += 4) {
                    parts.push(match.substring(i, i + 4));
                }
                
                if (parts.length) {
                    e.target.value = parts.join(' ');
                } else {
                    e.target.value = value;
                }
            });
        }

        // Real-time credit card type detection
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                this.detectCardType(e.target.value);
            });
        }
    }

    detectCardType(cardNumber) {
        const cardTypes = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/
        };

        const cardPreview = document.querySelector('.card-preview');
        if (!cardPreview) return;
        
        let cardType = 'unknown';

        for (const [type, pattern] of Object.entries(cardTypes)) {
            if (pattern.test(cardNumber.replace(/\s/g, ''))) {
                cardType = type;
                break;
            }
        }

        // Update card preview style based on card type
        cardPreview.className = 'card-preview ' + cardType;
    }

    showLoading(show) {
        const loadingElement = document.getElementById('booking-loading');
        const bookingForm = document.getElementById('booking-form-container');
        
        if (loadingElement && bookingForm) {
            if (show) {
                loadingElement.classList.add('active');
                bookingForm.style.display = 'none';
            } else {
                loadingElement.classList.remove('active');
                bookingForm.style.display = 'block';
            }
        }
    }

    showStepError(message) {
        // Remove existing error messages
        document.querySelectorAll('.step-error').forEach(error => error.remove());

        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message step-error';
        errorElement.textContent = message;
        errorElement.style.marginTop = '1rem';

        // Insert error message
        const currentStep = document.querySelector('.booking-step.active');
        if (currentStep) {
            currentStep.appendChild(errorElement);

            // Remove error after 5 seconds
            setTimeout(() => {
                errorElement.remove();
            }, 5000);
        }
    }
}

// Initialize booking system
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('booking-form-container')) {
        window.bookingSystem = new BookingSystem();
    }
});