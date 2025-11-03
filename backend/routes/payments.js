const express = require('express');
const stripe = require('../config/stripe');
const router = express.Router();

// Create Stripe payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', bookingId, customerEmail } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // in cents
            currency: currency,
            metadata: { 
                bookingId: bookingId,
                customerEmail: customerEmail
            },
            automatic_payment_methods: { 
                enabled: true 
            },
        });

        res.json({ 
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Create PayPal order (simulated for now)
router.post('/create-paypal-order', async (req, res) => {
    try {
        const { amount, currency = 'USD', bookingId } = req.body;
        
        // Simulate PayPal order creation
        // In production, integrate with actual PayPal API
        const orderID = 'PAYPAL_' + Date.now().toString(36);
        
        res.json({ 
            success: true,
            orderID: orderID,
            amount: amount,
            currency: currency
        });

    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Capture PayPal order (simulated for now)
router.post('/capture-paypal-order', async (req, res) => {
    try {
        const { orderID } = req.body;
        
        // Simulate PayPal capture
        // In production, integrate with actual PayPal API
        const transactionId = 'TXN_' + Date.now().toString(36);
        
        res.json({ 
            success: true, 
            transactionId: transactionId,
            message: 'Payment captured successfully'
        });

    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Refund payment
router.post('/refund', async (req, res) => {
    try {
        const { paymentIntentId, amount } = req.body;

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount
        });

        res.json({ 
            success: true,
            refundId: refund.id,
            status: refund.status
        });

    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;