// API Integration System - Enhanced with Backend Integration
class TravelAPI {
    constructor() {
        // Use local backend in development, production API in production
        this.baseURL = this.getBaseURL();
        this.backendURL = 'http://localhost:3001/api'; // Your new backend
        this.cache = new Map();
        this.requestQueue = new Map();
        this.init();
    }

    init() {
        this.setupInterceptors();
        this.setupErrorHandling();
        this.testBackendConnection();
    }

    getBaseURL() {
        // Use local backend for development, production API for live
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        return 'https://api.travl.com/v1';
    }

    // Generic API call method
    async call(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = this.generateCacheKey(url, options);
        
        // Check cache first
        if (options.cache !== false) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
        }
        
        // Check if request is already in progress
        if (this.requestQueue.has(cacheKey)) {
            return this.requestQueue.get(cacheKey);
        }
        
        const request = this.makeRequest(url, options, cacheKey);
        this.requestQueue.set(cacheKey, request);
        
        try {
            const response = await request;
            this.requestQueue.delete(cacheKey);
            return response;
        } catch (error) {
            this.requestQueue.delete(cacheKey);
            throw error;
        }
    }

    // Backend-specific API call (for your new Node.js backend)
    async backendCall(endpoint, options = {}) {
        const url = `${this.backendURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const startTime = performance.now();
        
        try {
            const response = await fetch(url, config);
            const duration = performance.now() - startTime;
            
            this.logRequest(url, config.method, duration, response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            const duration = performance.now() - startTime;
            this.logRequest(url, config.method, duration, 'ERROR');
            throw error;
        }
    }

    async makeRequest(url, options, cacheKey) {
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.getAuthToken(),
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        const startTime = performance.now();
        
        try {
            const response = await fetch(url, config);
            const duration = performance.now() - startTime;
            
            this.logRequest(url, config.method, duration, response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful responses
            if (options.cache !== false && config.method === 'GET') {
                this.setCache(cacheKey, data, options.cacheTTL);
            }
            
            return data;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.logRequest(url, config.method, duration, 'ERROR');
            throw error;
        }
    }

    // ==================== PAYMENT API METHODS ====================
    
    async createPaymentIntent(amount, currency = 'usd', bookingId, customerEmail) {
        return this.backendCall('/payments/create-payment-intent', {
            method: 'POST',
            body: {
                amount: amount,
                currency: currency,
                bookingId: bookingId,
                customerEmail: customerEmail
            },
            cache: false
        });
    }

    async createPayPalOrder(amount, currency = 'USD', bookingId) {
        return this.backendCall('/payments/create-paypal-order', {
            method: 'POST',
            body: {
                amount: amount,
                currency: currency,
                bookingId: bookingId
            },
            cache: false
        });
    }

    async capturePayPalOrder(orderID) {
        return this.backendCall('/payments/capture-paypal-order', {
            method: 'POST',
            body: { orderID },
            cache: false
        });
    }

    async refundPayment(paymentIntentId, amount) {
        return this.backendCall('/payments/refund', {
            method: 'POST',
            body: {
                paymentIntentId: paymentIntentId,
                amount: amount
            },
            cache: false
        });
    }

    // ==================== BACKEND BOOKING API METHODS ====================
    
    async createBackendBooking(bookingData) {
        return this.backendCall('/bookings/create', {
            method: 'POST',
            body: bookingData,
            cache: false
        });
    }

    async getBackendBooking(bookingId) {
        return this.backendCall(`/bookings/${bookingId}`, {
            cache: true,
            cacheTTL: 2 * 60 * 1000 // 2 minutes
        });
    }

    async getUserBackendBookings(userEmail) {
        return this.backendCall(`/bookings/user/${encodeURIComponent(userEmail)}`, {
            cache: true,
            cacheTTL: 2 * 60 * 1000 // 2 minutes
        });
    }

    // ==================== EXISTING API METHODS (KEEPING FOR COMPATIBILITY) ====================
    
    async searchDestinations(params) {
        const queryString = new URLSearchParams(params).toString();
        return this.call(`/destinations?${queryString}`, {
            cache: true,
            cacheTTL: 5 * 60 * 1000 // 5 minutes
        });
    }

    async getDestinationDetails(destinationId) {
        return this.call(`/destinations/${destinationId}`, {
            cache: true,
            cacheTTL: 10 * 60 * 1000 // 10 minutes
        });
    }

    async checkAvailability(destinationId, dates, travelers) {
        return this.call(`/availability/${destinationId}`, {
            method: 'POST',
            body: { dates, travelers },
            cache: false
        });
    }

    async getPrices(destinationId, dates, travelers) {
        return this.call(`/pricing/${destinationId}`, {
            method: 'POST',
            body: { dates, travelers },
            cache: false
        });
    }

    async createBooking(bookingData) {
        // Use backend for real bookings, fallback to mock
        try {
            return await this.createBackendBooking(bookingData);
        } catch (error) {
            console.warn('Backend booking failed, using mock:', error);
            return this.call('/bookings', {
                method: 'POST',
                body: bookingData,
                cache: false
            });
        }
    }

    async getBooking(bookingId) {
        // Try backend first, then fallback
        try {
            return await this.getBackendBooking(bookingId);
        } catch (error) {
            console.warn('Backend booking fetch failed, using mock:', error);
            return this.call(`/bookings/${bookingId}`, {
                cache: true
            });
        }
    }

    async cancelBooking(bookingId) {
        return this.call(`/bookings/${bookingId}/cancel`, {
            method: 'POST',
            cache: false
        });
    }

    async getUserBookings(userId) {
        // Try backend with user email, fallback to mock
        const user = window.authSystem?.getCurrentUser();
        if (user?.email) {
            try {
                return await this.getUserBackendBookings(user.email);
            } catch (error) {
                console.warn('Backend user bookings failed, using mock:', error);
            }
        }
        
        return this.call(`/users/${userId}/bookings`, {
            cache: true,
            cacheTTL: 2 * 60 * 1000 // 2 minutes
        });
    }

    async getReviews(destinationId, page = 1, limit = 10) {
        return this.call(`/destinations/${destinationId}/reviews?page=${page}&limit=${limit}`, {
            cache: true,
            cacheTTL: 10 * 60 * 1000 // 10 minutes
        });
    }

    async submitReview(reviewData) {
        return this.call('/reviews', {
            method: 'POST',
            body: reviewData,
            cache: false
        });
    }

    async getWeather(location, date) {
        return this.call('/weather', {
            method: 'POST',
            body: { location, date },
            cache: true,
            cacheTTL: 30 * 60 * 1000 // 30 minutes
        });
    }

    async getExchangeRates(baseCurrency = 'USD') {
        return this.call(`/exchange-rates?base=${baseCurrency}`, {
            cache: true,
            cacheTTL: 60 * 60 * 1000 // 1 hour
        });
    }

    // ==================== BACKEND HEALTH CHECK ====================
    
    async testBackendConnection() {
        try {
            const response = await fetch('http://localhost:3001/health');
            const data = await response.json();
            console.log('✅ Backend connection:', data);
            return true;
        } catch (error) {
            console.warn('❌ Backend not available:', error.message);
            return false;
        }
    }

    async getBackendHealth() {
        return this.backendCall('/health', {
            cache: false
        });
    }

    // ==================== EXISTING UTILITY METHODS (UNCHANGED) ====================
    
    // Cache management
    generateCacheKey(url, options) {
        return btoa(`${url}-${JSON.stringify(options)}`);
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data, ttl = 5 * 60 * 1000) {
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + ttl
        });
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const [key] of this.cache.entries()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Authentication
    getAuthToken() {
        const user = window.authSystem?.getCurrentUser();
        return user?.token ? `Bearer ${user.token}` : '';
    }

    // Request interceptors
    setupInterceptors() {
        // Add request timing
        this.originalCall = this.call;
        this.call = async (endpoint, options) => {
            const startTime = performance.now();
            try {
                const result = await this.originalCall(endpoint, options);
                const duration = performance.now() - startTime;
                
                // Log slow requests
                if (duration > 1000) {
                    console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
                }
                
                return result;
            } catch (error) {
                const duration = performance.now() - startTime;
                console.error(`API call failed: ${endpoint} after ${duration}ms`, error);
                throw error;
            }
        };
    }

    // Error handling
    setupErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message?.includes('HTTP')) {
                this.handleAPIError(event.reason);
                event.preventDefault();
            }
        });
    }

    handleAPIError(error) {
        const errorMessage = this.getErrorMessage(error);
        
        // Show user-friendly error message
        this.showErrorNotification(errorMessage);
        
        // Log error for monitoring
        this.logError(error);
        
        // Retry logic for certain errors
        if (this.shouldRetry(error)) {
            this.retryRequest(error);
        }
    }

    getErrorMessage(error) {
        const messages = {
            '400': 'Invalid request. Please check your input.',
            '401': 'Please log in to continue.',
            '403': 'You do not have permission to perform this action.',
            '404': 'The requested resource was not found.',
            '429': 'Too many requests. Please try again later.',
            '500': 'Server error. Please try again later.',
            '502': 'Service temporarily unavailable.',
            '503': 'Service temporarily unavailable.',
            '504': 'Request timeout. Please try again.'
        };
        
        const status = error.message.match(/HTTP (\d+)/)?.[1] || '500';
        return messages[status] || 'An unexpected error occurred.';
    }

    showErrorNotification(message) {
        // Check if we're in a test environment
        if (window.location.pathname.includes('test-payment.html')) {
            console.log('Error notification:', message);
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    logRequest(url, method, duration, status) {
        if (window.gtag) {
            gtag('event', 'api_request', {
                url: url,
                method: method,
                duration: duration,
                status: status
            });
        }
    }

    logError(error) {
        if (window.gtag) {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    shouldRetry(error) {
        const retryStatuses = [408, 429, 500, 502, 503, 504];
        const status = error.message.match(/HTTP (\d+)/)?.[1];
        return retryStatuses.includes(parseInt(status));
    }

    async retryRequest(originalError, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
                // Retry the original request
                return await this.makeRequest(...originalError.requestArgs);
            } catch (error) {
                if (i === retries - 1) throw error;
            }
        }
    }

    // Rate limiting
    setupRateLimiting() {
        this.requests = [];
        this.maxRequests = 100;
    }

    checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        this.requests = this.requests.filter(time => time > oneMinuteAgo);
        
        if (this.requests.length >= this.maxRequests) {
            throw new Error('Rate limit exceeded');
        }
        
        this.requests.push(now);
    }

    // Batch requests for efficiency
    async batchRequests(requests) {
        return Promise.all(requests.map(req => this.call(req.endpoint, req.options)));
    }

    // Real-time updates (WebSocket) - Enhanced for backend
    setupRealTimeUpdates() {
        if (this.socket) return;
        
        // Use backend WebSocket if available
        const wsURL = this.baseURL.replace('http', 'ws') + '/realtime';
        this.socket = new WebSocket(wsURL);
        
        this.socket.onopen = () => {
            console.log('WebSocket connected to backend');
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.setupRealTimeUpdates(), 5000);
        };
    }

    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'PRICE_UPDATE':
                this.handlePriceUpdate(data);
                break;
            case 'AVAILABILITY_UPDATE':
                this.handleAvailabilityUpdate(data);
                break;
            case 'BOOKING_UPDATE':
                this.handleBookingUpdate(data);
                break;
            case 'PAYMENT_UPDATE':
                this.handlePaymentUpdate(data);
                break;
        }
    }

    handlePaymentUpdate(data) {
        const event = new CustomEvent('paymentUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handlePriceUpdate(data) {
        const event = new CustomEvent('priceUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleAvailabilityUpdate(data) {
        const event = new CustomEvent('availabilityUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleBookingUpdate(data) {
        const event = new CustomEvent('bookingUpdate', { detail: data });
        window.dispatchEvent(event);
    }
}

// Initialize API system
document.addEventListener('DOMContentLoaded', () => {
    window.travelAPI = new TravelAPI();
});