// Enhanced Search with Real Data Integration
class EnhancedSearch extends AdvancedSearch {
    constructor() {
        super();
        this.realTimeData = {
            prices: new Map(),
            availability: new Map(),
            weather: new Map()
        };
        this.initRealTimeFeatures();
    }

    initRealTimeFeatures() {
        this.setupRealTimeUpdates();
        this.setupWeatherIntegration();
        this.setupLivePricing();
    }

    async loadSearchData() {
        try {
            // Load from API instead of static data
            const [destinations, hotels, flights] = await Promise.all([
                window.travelAPI.searchDestinations({ featured: true }),
                window.travelAPI.searchDestinations({ type: 'hotel', limit: 50 }),
                window.travelAPI.searchDestinations({ type: 'flight', limit: 50 })
            ]);

            this.searchData = [
                ...destinations.data.map(item => ({ ...item, type: 'destination' })),
                ...hotels.data.map(item => ({ ...item, type: 'hotel' })),
                ...flights.data.map(item => ({ ...item, type: 'flight' }))
            ];

            // Preload real-time data
            this.preloadRealTimeData();
        } catch (error) {
            console.error('Failed to load search data:', error);
            // Fallback to sample data
            super.loadSearchData();
        }
    }

    async preloadRealTimeData() {
        // Preload prices and availability for featured items
        const featuredItems = this.searchData.filter(item => item.featured);
        
        featuredItems.forEach(async item => {
            if (item.location) {
                // Get current weather
                const weather = await window.travelAPI.getWeather(
                    { lat: item.location.lat, lng: item.location.lng },
                    new Date().toISOString().split('T')[0]
                );
                this.realTimeData.weather.set(item.id, weather);
                
                // Get live pricing
                const prices = await window.travelAPI.getPrices(
                    item.id,
                    {
                        checkin: new Date().toISOString().split('T')[0],
                        checkout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    },
                    2
                );
                this.realTimeData.prices.set(item.id, prices);
            }
        });
    }

    setupRealTimeUpdates() {
        // Listen for real-time updates from API
        window.addEventListener('priceUpdate', (event) => {
            this.handlePriceUpdate(event.detail);
        });

        window.addEventListener('availabilityUpdate', (event) => {
            this.handleAvailabilityUpdate(event.detail);
        });
    }

    handlePriceUpdate(update) {
        this.realTimeData.prices.set(update.itemId, update.prices);
        
        // Update UI if this item is currently displayed
        const resultItem = document.querySelector(`[data-id="${update.itemId}"]`);
        if (resultItem) {
            this.updateItemPrice(resultItem, update.prices);
        }
    }

    handleAvailabilityUpdate(update) {
        this.realTimeData.availability.set(update.itemId, update.availability);
        
        // Update UI if this item is currently displayed
        const resultItem = document.querySelector(`[data-id="${update.itemId}"]`);
        if (resultItem) {
            this.updateItemAvailability(resultItem, update.availability);
        }
    }

    updateItemPrice(element, prices) {
        const priceElement = element.querySelector('.price');
        if (priceElement && prices.lowest) {
            priceElement.textContent = `From $${prices.lowest}`;
            
            // Add real-time badge
            if (!element.querySelector('.real-time-badge')) {
                const badge = document.createElement('span');
                badge.className = 'real-time-badge';
                badge.innerHTML = '<i class="fas fa-bolt"></i> Live Price';
                priceElement.appendChild(badge);
            }
        }
    }

    updateItemAvailability(element, availability) {
        if (availability.available === false) {
            element.classList.add('unavailable');
            const badge = document.createElement('div');
            badge.className = 'availability-badge unavailable';
            badge.textContent = 'Sold Out';
            element.querySelector('.card-body').appendChild(badge);
        }
    }

    setupWeatherIntegration() {
        // Add weather information to search results
        this.originalGetItemHTML = this.getItemHTML;
        this.getItemHTML = (item) => {
            let html = this.originalGetItemHTML(item);
            
            // Add weather info if available
            const weather = this.realTimeData.weather.get(item.id);
            if (weather) {
                html = this.injectWeatherInfo(html, weather);
            }
            
            return html;
        };
    }

    injectWeatherInfo(html, weather) {
        const weatherHTML = `
            <div class="weather-info">
                <i class="fas fa-${this.getWeatherIcon(weather.condition)}"></i>
                <span>${Math.round(weather.temperature)}°C</span>
                <span class="weather-condition">${weather.condition}</span>
            </div>
        `;
        
        // Insert weather info before the card footer
        return html.replace('</div><div class="card-footer">', `</div>${weatherHTML}<div class="card-footer">`);
    }

    getWeatherIcon(condition) {
        const icons = {
            'clear': 'sun',
            'clouds': 'cloud',
            'rain': 'cloud-rain',
            'snow': 'snowflake',
            'thunderstorm': 'bolt'
        };
        return icons[condition.toLowerCase()] || 'sun';
    }

    setupLivePricing() {
        // Update prices in real-time based on demand
        setInterval(() => {
            this.updateDynamicPricing();
        }, 30000); // Every 30 seconds
    }

    updateDynamicPricing() {
        // Simulate dynamic pricing based on demand
        this.searchData.forEach(item => {
            if (Math.random() < 0.1) { // 10% chance of price change
                const change = Math.random() < 0.5 ? 1.1 : 0.9; // ±10%
                item.price = Math.round(item.price * change);
                
                // Update UI if this item is displayed
                const element = document.querySelector(`[data-id="${item.id}"]`);
                if (element) {
                    const priceElement = element.querySelector('.price');
                    if (priceElement) {
                        priceElement.textContent = `From $${item.price}`;
                        this.animatePriceChange(priceElement);
                    }
                }
            }
        });
    }

    animatePriceChange(element) {
        element.classList.add('price-changing');
        setTimeout(() => {
            element.classList.remove('price-changing');
        }, 1000);
    }

    // Enhanced filters with real-time data
    applyFilters() {
        super.applyFilters();
        
        // Add real-time sorting options
        this.sortWithRealTimeData();
    }

    sortWithRealTimeData() {
        if (this.filters.sortBy === 'price-realtime') {
            this.currentResults.sort((a, b) => {
                const priceA = this.realTimeData.prices.get(a.id)?.lowest || a.price;
                const priceB = this.realTimeData.prices.get(b.id)?.lowest || b.price;
                return priceA - priceB;
            });
        }
    }

    // Advanced search with AI recommendations
    async getAIRecommendations(userPreferences, searchHistory) {
        try {
            const response = await window.travelAPI.call('/ai/recommendations', {
                method: 'POST',
                body: {
                    preferences: userPreferences,
                    history: searchHistory,
                    context: this.getSearchContext()
                }
            });
            return response.recommendations;
        } catch (error) {
            console.error('AI recommendations failed:', error);
            return this.getFallbackRecommendations();
        }
    }

    getSearchContext() {
        return {
            season: this.getCurrentSeason(),
            weather: this.getCurrentWeatherTrend(),
            events: this.getLocalEvents(),
            trends: this.getTravelTrends()
        };
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    getFallbackRecommendations() {
        // Fallback to popularity-based recommendations
        return this.searchData
            .filter(item => item.rating >= 4.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
    }
}