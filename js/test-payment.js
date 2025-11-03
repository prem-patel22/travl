// Test script for payment system
class PaymentTester {
    constructor() {
        this.testBookingData = {
            destination: {
                id: 'test-dest-1',
                name: 'Test Destination',
                price: 299,
                image: 'test.jpg'
            },
            checkin: '2024-12-20',
            checkout: '2024-12-25',
            travelers: 2,
            guests: [{
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com'
            }],
            totalPrice: 387.85,
            bookingId: 'TEST' + Date.now().toString().slice(-6)
        };
    }

    async testCreditCardPayment() {
        try {
            debugLog('Testing Credit Card Payment...');
            
            if (!window.paymentSystem) {
                throw new Error('Payment system not loaded');
            }

            const result = await window.paymentSystem.processCreditCardPayment({
                customerName: 'John Doe',
                customerEmail: 'john@test.com',
                totalAmount: 38785, // in cents
                bookingId: this.testBookingData.bookingId
            });

            displayResult('stripe-result', result);
            return result;

        } catch (error) {
            displayResult('stripe-result', { success: false, error: error.message });
        }
    }

    async testBookingFlow() {
        try {
            debugLog('Testing Complete Booking Flow...');
            
            // Simulate booking steps
            const bookingResult = await this.simulateBooking();
            displayResult('booking-result', bookingResult);
            return bookingResult;

        } catch (error) {
            displayResult('booking-result', { success: false, error: error.message });
        }
    }

    async simulateBooking() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    bookingId: this.testBookingData.bookingId,
                    message: 'Booking simulation completed',
                    steps: ['Details', 'Guests', 'Payment', 'Confirmation'],
                    paymentProcessed: true
                });
            }, 2000);
        });
    }

    getSystemStatus() {
        return {
            paymentSystem: !!window.paymentSystem,
            stripe: !!window.paymentSystem?.stripe,
            paypal: !!window.paymentSystem?.paypal,
            bookingSystem: !!window.bookingSystem,
            authSystem: !!window.authSystem,
            timestamp: new Date().toISOString()
        };
    }
}

// Global functions for HTML buttons
const tester = new PaymentTester();

function testCreditCardPayment() {
    tester.testCreditCardPayment();
}

function testBookingFlow() {
    tester.testBookingFlow();
}

function displayResult(elementId, result) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div style="margin-top: 10px; padding: 10px; border-radius: 5px; 
                    background: ${result.success ? '#d4edda' : '#f8d7da'}; 
                    color: ${result.success ? '#155724' : '#721c24'};">
            <strong>${result.success ? '✅ SUCCESS' : '❌ FAILED'}</strong><br>
            ${result.message || result.error}<br>
            ${result.transactionId ? `Transaction: ${result.transactionId}` : ''}
        </div>
    `;
}

function debugLog(message) {
    const debugElement = document.getElementById('debug-info');
    const currentContent = debugElement.textContent;
    debugElement.textContent = `${new Date().toLocaleTimeString()}: ${message}\n${currentContent}`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Payment tester initialized');
    
    // Display system status
    const status = tester.getSystemStatus();
    debugLog(`System Status: Payment=${status.paymentSystem}, Stripe=${status.stripe}, PayPal=${status.paypal}`);
    
    // Auto-mount Stripe element
    setTimeout(() => {
        if (window.paymentSystem && window.paymentSystem.mountCardElement) {
            window.paymentSystem.mountCardElement('stripe-card-element');
            debugLog('Stripe card element mounted');
        }
    }, 1000);
});