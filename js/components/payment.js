// Payment System Integration - Enhanced with Real Stripe/PayPal
class PaymentSystem {
    constructor() {
        this.stripe = null;
        this.stripeElements = null;
        this.cardElement = null;
        this.paypal = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            await this.loadStripe();
            await this.loadPayPal();
            this.isInitialized = true;
            console.log('Payment system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize payment system:', error);
        }
    }

    async loadStripe() {
        // Load Stripe.js from CDN
        if (!window.Stripe) {
            await this.loadScript('https://js.stripe.com/v3/');
        }
        
        // Initialize Stripe with your publishable key
        // Replace 'pk_test_your_key' with your actual Stripe publishable key
        this.stripe = Stripe('pk_test_your_publishable_key_here');
        
        // Create Stripe Elements
        this.stripeElements = this.stripe.elements();
        this.cardElement = this.stripeElements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });
        
        console.log('Stripe loaded successfully');
    }

    async loadPayPal() {
        // Load PayPal SDK
        if (!window.paypal) {
            await this.loadScript('https://www.paypal.com/sdk/js?client-id=your_client_id_here&currency=USD');
        }
        
        this.paypal = window.paypal;
        console.log('PayPal loaded successfully');
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    mountCardElement(containerId) {
        if (!this.cardElement) {
            console.error('Stripe not initialized');
            return;
        }
        
        const container = document.getElementById(containerId);
        if (container) {
            this.cardElement.mount(container);
        }
    }

    async processCreditCardPayment(bookingDetails) {
        try {
            this.showPaymentLoading(true);
            
            // 1. Create payment method using Stripe Elements
            const { paymentMethod, error } = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
                billing_details: {
                    name: bookingDetails.customerName,
                    email: bookingDetails.customerEmail,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            // 2. Call your backend to create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: bookingDetails.totalAmount,
                    currency: 'usd',
                    bookingId: bookingDetails.bookingId,
                    customerEmail: bookingDetails.customerEmail,
                }),
            });

            const { clientSecret, error: backendError } = await response.json();

            if (backendError) {
                throw new Error(backendError);
            }

            // 3. Confirm payment with Stripe
            const { paymentIntent, error: confirmError } = await this.stripe.confirmCardPayment(clientSecret);

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    transactionId: paymentIntent.id,
                    paymentMethod: 'credit_card',
                    message: 'Payment processed successfully'
                };
            } else {
                throw new Error('Payment failed');
            }

        } catch (error) {
            console.error('Credit card payment error:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.showPaymentLoading(false);
        }
    }

    async handlePayPalPayment(bookingDetails) {
        try {
            // This would be implemented with actual PayPal button
            // For now, we'll simulate the flow and call backend
            
            const response = await fetch('/api/create-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: bookingDetails.totalAmount,
                    currency: 'USD',
                    bookingId: bookingDetails.bookingId,
                    returnUrl: `${window.location.origin}/pages/payment-success.html`,
                    cancelUrl: `${window.location.origin}/pages/payment-failed.html`,
                }),
            });

            const { orderID, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            // In real implementation, this would redirect to PayPal
            // For demo, we'll simulate approval
            return await this.approvePayPalOrder(orderID);

        } catch (error) {
            console.error('PayPal payment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async approvePayPalOrder(orderID) {
        // Simulate PayPal approval process
        // In real implementation, user would be redirected to PayPal
        try {
            const response = await fetch('/api/capture-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderID }),
            });

            const { transactionId, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            return {
                success: true,
                transactionId: transactionId,
                paymentMethod: 'paypal',
                message: 'PayPal payment completed successfully'
            };

        } catch (error) {
            throw new Error(`PayPal capture failed: ${error.message}`);
        }
    }

    renderPayPalButton(containerId, bookingDetails) {
        if (!this.paypal) {
            console.error('PayPal not loaded');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        this.paypal.Buttons({
            createOrder: async (data, actions) => {
                const response = await fetch('/api/create-paypal-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: bookingDetails.totalAmount,
                        currency: 'USD',
                        bookingId: bookingDetails.bookingId,
                    }),
                });

                const { orderID } = await response.json();
                return orderID;
            },

            onApprove: async (data, actions) => {
                try {
                    const response = await fetch('/api/capture-paypal-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderID: data.orderID
                        }),
                    });

                    const { transactionId, error } = await response.json();

                    if (error) {
                        throw new Error(error);
                    }

                    // Payment successful
                    this.handlePaymentSuccess({
                        success: true,
                        transactionId: transactionId,
                        paymentMethod: 'paypal',
                        bookingId: bookingDetails.bookingId
                    });

                } catch (error) {
                    this.handlePaymentError(error.message);
                }
            },

            onError: (err) => {
                this.handlePaymentError(err.message || 'PayPal payment failed');
            },

            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            }

        }).render(container);
    }

    handlePaymentSuccess(paymentResult) {
        // Save payment result to localStorage or send to backend
        localStorage.setItem('last_payment_result', JSON.stringify(paymentResult));
        
        // Redirect to success page with booking details
        const successUrl = `/pages/payment-success.html?booking=${paymentResult.bookingId}&transaction=${paymentResult.transactionId}`;
        window.location.href = successUrl;
    }

    handlePaymentError(errorMessage) {
        // Show error to user
        this.showPaymentError(errorMessage);
        
        // Log error for debugging
        console.error('Payment error:', errorMessage);
    }

    showPaymentError(message) {
        // Create or show error message element
        let errorElement = document.getElementById('payment-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'payment-error';
            errorElement.className = 'payment-error';
            errorElement.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 1rem;
                border-radius: 4px;
                margin: 1rem 0;
            `;
            document.querySelector('.payment-container').prepend(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    showPaymentLoading(show) {
        const paymentButtons = document.querySelectorAll('.payment-button, .paypal-button');
        const loadingElement = document.getElementById('payment-loading') || this.createLoadingElement();
        
        paymentButtons.forEach(button => {
            if (show) {
                button.disabled = true;
                button.style.opacity = '0.6';
            } else {
                button.disabled = false;
                button.style.opacity = '1';
            }
        });
        
        loadingElement.style.display = show ? 'block' : 'none';
    }

    createLoadingElement() {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'payment-loading';
        loadingElement.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p>Processing payment...</p>
            </div>
        `;
        loadingElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(loadingElement);
        return loadingElement;
    }

    // Keep your existing validation methods (they're good!)
    validateCardDetails(cardDetails) {
        const errors = [];
        if (!this.isValidCardNumber(cardDetails.cardNumber)) {
            errors.push('Invalid card number');
        }
        if (!this.isValidExpiryDate(cardDetails.expiryDate)) {
            errors.push('Invalid expiry date');
        }
        if (!this.isValidCVV(cardDetails.cvv)) {
            errors.push('Invalid CVV');
        }
        return errors;
    }

    isValidCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(cleanNumber)) return false;
        let sum = 0;
        let isEven = false;
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i), 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
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
            if (pattern.test(cleanNumber)) return type;
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
            const response = await fetch('/api/refund-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId,
                    amount
                }),
            });

            const { success, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

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