// Payment System Integration
class PaymentSystem {
    constructor() {
        this.stripe = null;
        this.paypal = null;
        this.init();
    }

    async init() {
        await this.loadStripe();
        await this.loadPayPal();
    }

    async loadStripe() {
        // In a real implementation, you would load Stripe.js
        // For demo purposes, we'll simulate Stripe functionality
        console.log('Stripe loaded successfully');
        
        this.stripe = {
            createPaymentMethod: async (cardElement) => {
                // Simulate Stripe payment method creation
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            error: null,
                            paymentMethod: {
                                id: 'pm_' + Math.random().toString(36).substr(2, 10)
                            }
                        });
                    }, 1000);
                });
            },
            confirmCardPayment: async (clientSecret) => {
                // Simulate payment confirmation
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            error: null,
                            paymentIntent: {
                                id: 'pi_' + Math.random().toString(36).substr(2, 10),
                                status: 'succeeded'
                            }
                        });
                    }, 2000);
                });
            }
        };
    }

    async loadPayPal() {
        // In a real implementation, you would load PayPal SDK
        console.log('PayPal loaded successfully');
        
        this.paypal = {
            render: (element, options) => {
                // Simulate PayPal button rendering
                const button = document.createElement('button');
                button.className = 'btn-primary btn-full';
                button.innerHTML = '<i class="fab fa-paypal"></i> Pay with PayPal';
                button.onclick = () => this.handlePayPalPayment();
                element.appendChild(button);
            }
        };
    }

    async processCreditCardPayment(cardDetails) {
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate random success (90% success rate)
            const success = Math.random() > 0.1;
            
            if (success) {
                return {
                    success: true,
                    transactionId: 'txn_' + Date.now().toString(36),
                    message: 'Payment processed successfully'
                };
            } else {
                throw new Error('Payment declined by bank');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async handlePayPalPayment() {
        try {
            // Show loading state
            this.showPaymentLoading(true);
            
            // Simulate PayPal payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simulate random success (85% success rate)
            const success = Math.random() > 0.15;
            
            if (success) {
                return {
                    success: true,
                    transactionId: 'PAYPAL_' + Date.now().toString(36),
                    message: 'PayPal payment completed successfully'
                };
            } else {
                throw new Error('PayPal payment failed');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.showPaymentLoading(false);
        }
    }

    showPaymentLoading(show) {
        const paymentButtons = document.querySelectorAll('.payment-method button');
        paymentButtons.forEach(button => {
            if (show) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                button.disabled = false;
                button.innerHTML = button.getAttribute('data-original-text');
            }
        });
    }

    validateCardDetails(cardDetails) {
        const errors = [];

        // Card number validation (Luhn algorithm)
        if (!this.isValidCardNumber(cardDetails.cardNumber)) {
            errors.push('Invalid card number');
        }

        // Expiry date validation
        if (!this.isValidExpiryDate(cardDetails.expiryDate)) {
            errors.push('Invalid expiry date');
        }

        // CVV validation
        if (!this.isValidCVV(cardDetails.cvv)) {
            errors.push('Invalid CVV');
        }

        return errors;
    }

    isValidCardNumber(cardNumber) {
        // Remove spaces and check if it's a number
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(cleanNumber)) return false;

        // Luhn algorithm implementation
        let sum = 0;
        let isEven = false;

        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    isValidExpiryDate(expiryDate) {
        const [month, year] = expiryDate.split('/');
        if (!month || !year) return false;

        const now = new Date();
        const expiry = new Date(parseInt('20' + year), parseInt(month) - 1);
        
        return expiry > now;
    }

    isValidCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    getCardType(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            diners: /^3(?:0[0-5]|[68])/,
            jcb: /^35/
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(cleanNumber)) {
                return type;
            }
        }

        return 'unknown';
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    async refundPayment(transactionId, amount) {
        try {
            // Simulate refund processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return {
                success: true,
                refundId: 'ref_' + Date.now().toString(36),
                message: 'Refund processed successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize payment system
document.addEventListener('DOMContentLoaded', () => {
    window.paymentSystem = new PaymentSystem();
});