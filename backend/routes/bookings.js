const express = require('express');
const router = express.Router();

// In-memory storage for demo (use database in production)
let bookings = [];

// Create booking
router.post('/create', async (req, res) => {
    try {
        const { 
            destination, 
            checkin, 
            checkout, 
            travelers, 
            guests, 
            totalPrice, 
            paymentMethod,
            transactionId 
        } = req.body;

        const booking = {
            id: 'TRV' + Date.now().toString().slice(-8),
            destination: destination,
            checkin: checkin,
            checkout: checkout,
            travelers: travelers,
            guests: guests,
            totalPrice: totalPrice,
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        bookings.push(booking);

        res.json({
            success: true,
            booking: booking,
            message: 'Booking created successfully'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // For demo, return all bookings
        // In production, filter by user ID
        const userBookings = bookings.filter(booking => 
            booking.guests.some(guest => guest.email === userId)
        );

        res.json({
            success: true,
            bookings: userBookings
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get booking by ID
router.get('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = bookings.find(b => b.id === bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: booking
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;