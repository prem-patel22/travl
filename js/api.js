// API Integration System
class TravelAPI {
    constructor() {
        this.baseURL = 'https://api.travl.com/v1';
        this.cache = new Map();
        this.requestQueue = new Map();
        this.init();
    }

    init() {
        this.setupInterceptors();
        this.setupErrorHandling();
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

    // Specific API methods
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
        return this.call('/bookings', {
            method: 'POST',
            body: bookingData,
            cache: false
        });
    }

    async getBooking(bookingId) {
        return this.call(`/bookings/${bookingId}`, {
            cache: true
        });
    }

    async cancelBooking(bookingId) {
        return this.call(`/bookings/${bookingId}/cancel`, {
            method: 'POST',
            cache: false
        });
    }

    async getUserBookings(userId) {
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
        // Implementation for retry logic
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
        this.maxRequests = 100; // requests per minute
    }

    checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Remove old requests
        this.requests = this.requests.filter(time => time > oneMinuteAgo);
        
        // Check if limit exceeded
        if (this.requests.length >= this.maxRequests) {
            throw new Error('Rate limit exceeded');
        }
        
        // Add current request
        this.requests.push(now);
    }

    // Batch requests for efficiency
    async batchRequests(requests) {
        return Promise.all(requests.map(req => this.call(req.endpoint, req.options)));
    }

    // Real-time updates (WebSocket)
    setupRealTimeUpdates() {
        if (this.socket) return;
        
        this.socket = new WebSocket('wss://api.travl.com/realtime');
        
        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt reconnect after delay
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
        }
    }

    handlePriceUpdate(data) {
        // Update prices in UI
        const event = new CustomEvent('priceUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleAvailabilityUpdate(data) {
        // Update availability in UI
        const event = new CustomEvent('availabilityUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleBookingUpdate(data) {
        // Update booking status in UI
        const event = new CustomEvent('bookingUpdate', { detail: data });
        window.dispatchEvent(event);
    }
}

// Initialize API system
document.addEventListener('DOMContentLoaded', () => {
    window.travelAPI = new TravelAPI();
});