// Destinations page functionality
class DestinationsPage {
    constructor() {
        this.destinations = [];
        this.filteredDestinations = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.filters = {
            priceMin: 0,
            priceMax: 5000,
            continents: ['europe', 'asia', 'america'],
            rating: 0,
            sortBy: 'popular'
        };
        
        this.init();
    }

    init() {
        this.loadDestinations();
        this.setupEventListeners();
        this.applyFiltersFromURL();
    }

    loadDestinations() {
        // Sample destinations data - in real app, this would come from an API
        this.destinations = [
            {
                id: 1,
                name: 'Bali, Indonesia',
                description: 'Island of Gods with beautiful beaches and temples',
                price: 899,
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.8,
                duration: '7 Days',
                continent: 'asia',
                featured: true
            },
            {
                id: 2,
                name: 'Paris, France',
                description: 'The city of love with iconic landmarks and cuisine',
                price: 1199,
                image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.9,
                duration: '5 Days',
                continent: 'europe',
                featured: true
            },
            {
                id: 3,
                name: 'Tokyo, Japan',
                description: 'Modern metropolis with rich culture and technology',
                price: 1499,
                image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.7,
                duration: '6 Days',
                continent: 'asia',
                featured: true
            },
            {
                id: 4,
                name: 'New York, USA',
                description: 'The city that never sleeps with iconic skyline',
                price: 1299,
                image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.6,
                duration: '4 Days',
                continent: 'america',
                featured: false
            },
            {
                id: 5,
                name: 'Rome, Italy',
                description: 'Eternal city with ancient history and delicious food',
                price: 1099,
                image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.8,
                duration: '5 Days',
                continent: 'europe',
                featured: false
            },
            {
                id: 6,
                name: 'Sydney, Australia',
                description: 'Vibrant city with iconic opera house and beaches',
                price: 1599,
                image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                rating: 4.7,
                duration: '8 Days',
                continent: 'australia',
                featured: false
            }
        ];

        this.applyFilters();
    }

    setupEventListeners() {
        // Filter events
        document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        // Load more button
        document.getElementById('load-more').addEventListener('click', () => this.loadMore());

        // Checkbox filters
        document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleCheckboxFilter());
        });

        // Price filters
        document.getElementById('price-min').addEventListener('input', 
            window.travlUtils.debounce(() => this.handlePriceFilter(), 500));
        document.getElementById('price-max').addEventListener('input', 
            window.travlUtils.debounce(() => this.handlePriceFilter(), 500));

        // Rating filters
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleRatingFilter());
        });
    }

    handleCheckboxFilter() {
        const checkedContinents = [];
        document.querySelectorAll('.filter-group input[type="checkbox"]:checked').forEach(checkbox => {
            checkedContinents.push(checkbox.id);
        });
        this.filters.continents = checkedContinents;
        this.applyFilters();
    }

    handlePriceFilter() {
        const priceMin = document.getElementById('price-min').value;
        const priceMax = document.getElementById('price-max').value;
        
        this.filters.priceMin = priceMin ? parseInt(priceMin) : 0;
        this.filters.priceMax = priceMax ? parseInt(priceMax) : 5000;
        
        this.applyFilters();
    }

    handleRatingFilter() {
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        this.filters.rating = selectedRating ? parseFloat(selectedRating.id.split('-')[1]) : 0;
        this.applyFilters();
    }

    applyFilters() {
        this.currentPage = 1;
        
        // Filter destinations
        this.filteredDestinations = this.destinations.filter(destination => {
            // Price filter
            if (destination.price < this.filters.priceMin || destination.price > this.filters.priceMax) {
                return false;
            }
            
            // Continent filter
            if (!this.filters.continents.includes(destination.continent)) {
                return false;
            }
            
            // Rating filter
            if (destination.rating < this.filters.rating) {
                return false;
            }
            
            return true;
        });

        // Sort destinations
        this.sortDestinations();
        
        // Render results
        this.renderDestinations();
        this.updateResultsCount();
    }

    sortDestinations() {
        switch (this.filters.sortBy) {
            case 'price-low':
                this.filteredDestinations.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredDestinations.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredDestinations.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
            default:
                this.filteredDestinations.sort((a, b) => b.featured - a.featured);
                break;
        }
    }

    renderDestinations() {
        const grid = document.getElementById('destinations-grid');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const destinationsToShow = this.filteredDestinations.slice(0, endIndex);

        grid.innerHTML = destinationsToShow.map(destination => `
            <div class="destination-card" data-id="${destination.id}">
                <div class="destination-image">
                    <img src="${destination.image}" alt="${destination.name}">
                    <div class="destination-overlay">
                        <div class="destination-price">From $${destination.price}</div>
                    </div>
                </div>
                <div class="destination-content">
                    <h3>${destination.name}</h3>
                    <p>${destination.description}</p>
                    <div class="destination-meta">
                        <span><i class="fas fa-star"></i> ${destination.rating}</span>
                        <span><i class="fas fa-clock"></i> ${destination.duration}</span>
                    </div>
                    <button class="btn-primary btn-full view-destination" data-id="${destination.id}">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to view buttons
        document.querySelectorAll('.view-destination').forEach(button => {
            button.addEventListener('click', (e) => {
                const destinationId = e.target.getAttribute('data-id');
                this.viewDestination(destinationId);
            });
        });

        // Show/hide load more button
        const loadMoreButton = document.getElementById('load-more');
        if (endIndex >= this.filteredDestinations.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderDestinations();
    }

    viewDestination(destinationId) {
        const destination = this.destinations.find(d => d.id == destinationId);
        if (destination) {
            // In a real app, this would redirect to a detailed destination page
            alert(`Viewing details for: ${destination.name}\nPrice: $${destination.price}\nRating: ${destination.rating}/5`);
        }
    }

    updateResultsCount() {
        const resultsHeader = document.querySelector('.results-header h2');
        const count = this.filteredDestinations.length;
        resultsHeader.textContent = `Popular Destinations (${count} results)`;
    }

    applyFiltersFromURL() {
        const searchParam = window.travlUtils.getQueryParam('search');
        if (searchParam) {
            // If there's a search parameter, filter by destination name
            this.destinations = this.destinations.filter(destination =>
                destination.name.toLowerCase().includes(searchParam.toLowerCase())
            );
            this.applyFilters();
        }
    }
}

// Initialize destinations page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DestinationsPage();
});