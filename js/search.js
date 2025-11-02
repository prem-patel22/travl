// Advanced Search System
class AdvancedSearch {
    constructor() {
        this.searchData = [];
        this.currentResults = [];
        this.filters = {
            query: '',
            type: 'all',
            priceRange: [0, 5000],
            rating: 0,
            amenities: [],
            activities: [],
            location: null,
            dates: {
                checkin: null,
                checkout: null
            }
        };
        
        this.init();
    }

    init() {
        this.loadSearchData();
        this.setupEventListeners();
        this.initializeAutocomplete();
    }

    loadSearchData() {
        // Load destinations, hotels, and flights data
        this.searchData = [
            // Destinations
            {
                id: 'd1',
                type: 'destination',
                name: 'Bali, Indonesia',
                description: 'Island of Gods with beautiful beaches and temples',
                price: 899,
                rating: 4.8,
                location: { lat: -8.4095, lng: 115.1889 },
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                amenities: ['beach', 'spa', 'pool', 'wifi'],
                activities: ['surfing', 'yoga', 'culture', 'adventure']
            },
            {
                id: 'd2',
                type: 'destination',
                name: 'Paris, France',
                description: 'The city of love with iconic landmarks and cuisine',
                price: 1199,
                rating: 4.9,
                location: { lat: 48.8566, lng: 2.3522 },
                image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                amenities: ['city', 'museum', 'shopping', 'fine-dining'],
                activities: ['sightseeing', 'shopping', 'culture', 'food']
            },
            // Hotels
            {
                id: 'h1',
                type: 'hotel',
                name: 'Luxury Beach Resort',
                description: '5-star beachfront resort with spa and fine dining',
                price: 299,
                rating: 4.7,
                location: { lat: -8.4095, lng: 115.1889 },
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                amenities: ['pool', 'spa', 'wifi', 'breakfast', 'gym'],
                destination: 'Bali, Indonesia'
            },
            // Flights
            {
                id: 'f1',
                type: 'flight',
                name: 'New York to Bali',
                description: 'Direct flight with premium amenities',
                price: 899,
                rating: 4.5,
                departure: 'JFK',
                arrival: 'DPS',
                duration: '18h 30m',
                airline: 'Global Airlines'
            }
        ];
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', 
                window.travlUtils.debounce(() => this.handleSearchInput(), 300));
        }

        // Filter changes
        document.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });

        // Price range
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.addEventListener('input', 
                window.travlUtils.debounce(() => this.handlePriceRangeChange(), 500));
        }

        // Date inputs
        const checkinInput = document.getElementById('checkin-date');
        const checkoutInput = document.getElementById('checkout-date');
        if (checkinInput && checkoutInput) {
            checkinInput.addEventListener('change', () => this.handleDateChange());
            checkoutInput.addEventListener('change', () => this.handleDateChange());
        }

        // Quick filters
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', (e) => this.handleQuickFilter(e));
        });

        // Search tabs
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSearchType(e));
        });
    }

    initializeAutocomplete() {
        this.autocomplete = new SearchAutocomplete(this.searchData);
    }

    handleSearchInput() {
        const query = document.getElementById('search-input').value;
        this.filters.query = query;
        
        if (query.length > 2) {
            this.autocomplete.showSuggestions(query);
        } else {
            this.autocomplete.hideSuggestions();
        }
        
        this.applyFilters();
    }

    handlePriceRangeChange() {
        const priceRange = document.getElementById('price-range');
        const priceValue = document.getElementById('price-value');
        
        if (priceRange && priceValue) {
            const value = priceRange.value;
            this.filters.priceRange = [0, parseInt(value)];
            priceValue.textContent = `Up to $${value}`;
            this.applyFilters();
        }
    }

    handleDateChange() {
        const checkin = document.getElementById('checkin-date').value;
        const checkout = document.getElementById('checkout-date').value;
        
        this.filters.dates.checkin = checkin;
        this.filters.dates.checkout = checkout;
        this.applyFilters();
    }

    handleQuickFilter(e) {
        const filter = e.target;
        const filterType = filter.getAttribute('data-filter');
        const filterValue = filter.getAttribute('data-value');
        
        filter.classList.toggle('active');
        
        if (filterType === 'amenity') {
            if (filter.classList.contains('active')) {
                this.filters.amenities.push(filterValue);
            } else {
                this.filters.amenities = this.filters.amenities.filter(a => a !== filterValue);
            }
        } else if (filterType === 'activity') {
            if (filter.classList.contains('active')) {
                this.filters.activities.push(filterValue);
            } else {
                this.filters.activities = this.filters.activities.filter(a => a !== filterValue);
            }
        }
        
        this.applyFilters();
    }

    switchSearchType(e) {
        const tab = e.target;
        const searchType = tab.getAttribute('data-type');
        
        // Update active tab
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.filters.type = searchType;
        this.applyFilters();
        this.updateSearchForm(searchType);
    }

    updateSearchForm(searchType) {
        // Show/hide form fields based on search type
        const formFields = document.querySelectorAll('.search-field-advanced');
        
        formFields.forEach(field => {
            const fieldType = field.getAttribute('data-for');
            if (fieldType === 'all' || fieldType === searchType) {
                field.style.display = 'block';
            } else {
                field.style.display = 'none';
            }
        });
    }

    applyFilters() {
        let results = this.searchData;

        // Text search
        if (this.filters.query) {
            results = results.filter(item =>
                item.name.toLowerCase().includes(this.filters.query.toLowerCase()) ||
                item.description.toLowerCase().includes(this.filters.query.toLowerCase())
            );
        }

        // Type filter
        if (this.filters.type !== 'all') {
            results = results.filter(item => item.type === this.filters.type);
        }

        // Price filter
        results = results.filter(item => 
            item.price >= this.filters.priceRange[0] && 
            item.price <= this.filters.priceRange[1]
        );

        // Rating filter
        if (this.filters.rating > 0) {
            results = results.filter(item => item.rating >= this.filters.rating);
        }

        // Amenities filter
        if (this.filters.amenities.length > 0) {
            results = results.filter(item =>
                this.filters.amenities.every(amenity =>
                    item.amenities?.includes(amenity)
                )
            );
        }

        // Activities filter
        if (this.filters.activities.length > 0) {
            results = results.filter(item =>
                this.filters.activities.every(activity =>
                    item.activities?.includes(activity)
                )
            );
        }

        this.currentResults = results;
        this.renderResults();
        this.updateMapMarkers();
    }

    renderResults() {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (this.currentResults.length === 0) {
            resultsContainer.innerHTML = this.getNoResultsHTML();
            return;
        }

        resultsContainer.innerHTML = this.currentResults.map(item => this.getItemHTML(item)).join('');
        
        // Add event listeners to result items
        document.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => this.viewItemDetails(item.dataset.id));
        });
    }

    getItemHTML(item) {
        return `
            <div class="result-item card" data-id="${item.id}">
                <div class="card-image">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="card-badge">
                        ${item.type === 'destination' ? 'Destination' : 
                          item.type === 'hotel' ? 'Hotel' : 'Flight'}
                    </div>
                </div>
                <div class="card-body">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="item-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${item.rating}
                        </span>
                        <span class="price">
                            From $${item.price}
                        </span>
                    </div>
                    ${item.amenities ? `
                        <div class="item-amenities">
                            ${item.amenities.slice(0, 3).map(amenity => 
                                `<span class="amenity-tag">${amenity}</span>`
                            ).join('')}
                            ${item.amenities.length > 3 ? 
                                `<span class="amenity-more">+${item.amenities.length - 3} more</span>` : ''
                            }
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn-primary view-details" data-id="${item.id}">
                        View Details
                    </button>
                    <button class="btn-outline add-wishlist" data-id="${item.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getNoResultsHTML() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button class="btn-primary" onclick="this.clearFilters()">
                    Clear All Filters
                </button>
            </div>
        `;
    }

    clearFilters() {
        this.filters = {
            query: '',
            type: 'all',
            priceRange: [0, 5000],
            rating: 0,
            amenities: [],
            activities: [],
            location: null,
            dates: { checkin: null, checkout: null }
        };
        
        // Reset UI
        document.getElementById('search-input').value = '';
        document.getElementById('price-range').value = 5000;
        document.getElementById('price-value').textContent = 'Up to $5000';
        document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('.filter-input').forEach(i => i.checked = false);
        
        this.applyFilters();
    }

    viewItemDetails(itemId) {
        const item = this.searchData.find(i => i.id === itemId);
        if (item) {
            if (item.type === 'destination') {
                window.location.href = `pages/destination-detail.html?id=${itemId}`;
            } else {
                this.showItemModal(item);
            }
        }
    }

    showItemModal(item) {
        // Implementation for modal display
        console.log('Showing details for:', item);
    }

    updateMapMarkers() {
        if (window.searchMap) {
            window.searchMap.updateMarkers(this.currentResults);
        }
    }
}

// Autocomplete Class
class SearchAutocomplete {
    constructor(data) {
        this.data = data;
        this.resultsContainer = document.getElementById('autocomplete-results');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-container')) {
                this.hideSuggestions();
            }
        });
    }

    showSuggestions(query) {
        const suggestions = this.getSuggestions(query);
        this.renderSuggestions(suggestions);
        this.resultsContainer.style.display = 'block';
    }

    hideSuggestions() {
        this.resultsContainer.style.display = 'none';
    }

    getSuggestions(query) {
        return this.data.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    renderSuggestions(suggestions) {
        this.resultsContainer.innerHTML = suggestions.map(item => `
            <div class="autocomplete-item" data-id="${item.id}">
                <div class="name">${item.name}</div>
                <div class="type">${item.type}</div>
            </div>
        `).join('');

        // Add click listeners
        this.resultsContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => this.selectSuggestion(item.dataset.id));
        });
    }

    selectSuggestion(itemId) {
        const item = this.data.find(i => i.id === itemId);
        if (item) {
            document.getElementById('search-input').value = item.name;
            this.hideSuggestions();
            // Trigger search with selected item
            window.advancedSearch.filters.query = item.name;
            window.advancedSearch.applyFilters();
        }
    }
}

// Initialize advanced search
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new AdvancedSearch();
});