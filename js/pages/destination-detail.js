// Destination Detail Page
class DestinationDetail {
    constructor() {
        this.destination = null;
        this.init();
    }

    init() {
        this.loadDestinationData();
        this.setupEventListeners();
        this.initializeMap();
    }

    loadDestinationData() {
        const urlParams = new URLSearchParams(window.location.search);
        const destinationId = urlParams.get('id');

        // In a real app, this would be an API call
        // For demo, we'll use sample data
        this.destination = this.getDestinationById(destinationId);
        
        if (this.destination) {
            this.renderDestination();
            this.renderReviews();
            this.loadSimilarDestinations();
        } else {
            this.showError('Destination not found');
        }
    }

    getDestinationById(id) {
        const sampleDestinations = {
            'd1': {
                id: 'd1',
                name: 'Bali, Indonesia',
                description: 'Bali is a magical destination known as the Island of Gods. With its stunning beaches, ancient temples, vibrant culture, and warm hospitality, Bali offers an unforgettable experience for every traveler. From the lush rice terraces of Ubud to the surf-friendly beaches of Canggu, every corner of this island paradise tells a story.',
                price: 899,
                rating: 4.8,
                location: { lat: -8.4095, lng: 115.1889 },
                address: 'Bali, Indonesia',
                images: [
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1558002037-2b6a2a9c4e5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                ],
                highlights: [
                    {
                        icon: 'fa-umbrella-beach',
                        title: 'Stunning Beaches',
                        description: 'White sand beaches with crystal clear waters'
                    },
                    {
                        icon: 'fa-place-of-worship',
                        title: 'Ancient Temples',
                        description: 'Thousands of beautiful Hindu temples'
                    },
                    {
                        icon: 'fa-utensils',
                        title: 'Delicious Cuisine',
                        description: 'Authentic Balinese food and international dishes'
                    },
                    {
                        icon: 'fa-spa',
                        title: 'Wellness & Spa',
                        description: 'World-class spas and wellness retreats'
                    }
                ],
                included: [
                    'Return flights',
                    '5-star accommodation',
                    'Daily breakfast',
                    'Airport transfers',
                    'Guided tours',
                    'Travel insurance'
                ],
                itinerary: [
                    {
                        day: 'Day 1',
                        activities: [
                            {
                                time: '09:00 AM',
                                title: 'Arrival in Bali',
                                description: 'Meet and greet at Denpasar Airport'
                            },
                            {
                                time: '02:00 PM',
                                title: 'Check-in Hotel',
                                description: 'Relax at your luxury beach resort'
                            }
                        ]
                    },
                    {
                        day: 'Day 2',
                        activities: [
                            {
                                time: '08:00 AM',
                                title: 'Ubud Tour',
                                description: 'Visit rice terraces and sacred monkey forest'
                            },
                            {
                                time: '01:00 PM',
                                title: 'Traditional Lunch',
                                description: 'Authentic Balinese cuisine experience'
                            }
                        ]
                    }
                ]
            },
            'd2': {
                id: 'd2',
                name: 'Paris, France',
                description: 'The City of Light awaits with its romantic ambiance, world-class museums, and iconic landmarks. From the Eiffel Tower to the Louvre, Paris offers an unparalleled cultural experience combined with exquisite cuisine and charming neighborhoods.',
                price: 1199,
                rating: 4.9,
                location: { lat: 48.8566, lng: 2.3522 },
                address: 'Paris, France',
                images: [
                    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                ],
                highlights: [
                    {
                        icon: 'fa-landmark',
                        title: 'Iconic Landmarks',
                        description: 'Eiffel Tower, Louvre, and Arc de Triomphe'
                    },
                    {
                        icon: 'fa-wine-bottle',
                        title: 'Gourmet Cuisine',
                        description: 'World-renowned French gastronomy'
                    },
                    {
                        icon: 'fa-palette',
                        title: 'Art & Culture',
                        description: 'Home to the world\'s finest museums'
                    },
                    {
                        icon: 'fa-ring',
                        title: 'Romantic Getaway',
                        description: 'Perfect destination for couples'
                    }
                ],
                included: [
                    'Return flights',
                    'Boutique hotel accommodation',
                    'Daily breakfast',
                    'Museum passes',
                    'River cruise ticket',
                    'City tour guide'
                ],
                itinerary: [
                    {
                        day: 'Day 1',
                        activities: [
                            {
                                time: '10:00 AM',
                                title: 'Arrival in Paris',
                                description: 'Transfer to your hotel in the city center'
                            },
                            {
                                time: '03:00 PM',
                                title: 'Eiffel Tower Visit',
                                description: 'Ascend to the top for panoramic views'
                            }
                        ]
                    }
                ]
            }
        };

        return sampleDestinations[id] || null;
    }

    renderDestination() {
        if (!this.destination) return;

        // Update page title
        document.title = `${this.destination.name} - travl`;

        // Update hero section
        document.getElementById('hero-background').style.backgroundImage = `url('${this.destination.images[0]}')`;
        document.getElementById('destination-name').textContent = this.destination.name;
        document.getElementById('detail-title').textContent = this.destination.name;
        document.getElementById('detail-rating').innerHTML = `<i class="fas fa-star"></i> ${this.destination.rating}`;
        document.getElementById('detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.destination.address}`;
        document.getElementById('detail-price').textContent = `From $${this.destination.price}`;
        document.getElementById('sidebar-price').textContent = `From $${this.destination.price}`;

        // Update description
        document.getElementById('destination-description').textContent = this.destination.description;

        // Render image gallery
        this.renderImageGallery();

        // Render highlights
        this.renderHighlights();

        // Render included items
        this.renderIncludedItems();

        // Render itinerary
        this.renderItinerary();

        // Update wishlist button
        this.updateWishlistButton();

        // Update booking widget
        this.setupBookingWidget();
    }

    renderImageGallery() {
        const mainImage = document.getElementById('main-image');
        const thumbsContainer = document.getElementById('gallery-thumbs');

        if (mainImage && this.destination.images.length > 0) {
            mainImage.src = this.destination.images[0];
            mainImage.alt = this.destination.name;
        }

        if (thumbsContainer) {
            thumbsContainer.innerHTML = this.destination.images.map((image, index) => `
                <div class="gallery-thumb ${index === 0 ? 'active' : ''}" data-image="${image}">
                    <img src="${image}" alt="${this.destination.name} - Image ${index + 1}">
                </div>
            `).join('');

            // Add click listeners to thumbnails
            thumbsContainer.querySelectorAll('.gallery-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const imageUrl = thumb.getAttribute('data-image');
                    mainImage.src = imageUrl;
                    
                    // Update active state
                    thumbsContainer.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }
    }

    renderHighlights() {
        const highlightsGrid = document.getElementById('highlights-grid');
        if (highlightsGrid && this.destination.highlights) {
            highlightsGrid.innerHTML = this.destination.highlights.map(highlight => `
                <div class="highlight-card">
                    <div class="highlight-icon">
                        <i class="fas ${highlight.icon}"></i>
                    </div>
                    <h4>${highlight.title}</h4>
                    <p>${highlight.description}</p>
                </div>
            `).join('');
        }
    }

    renderIncludedItems() {
        const includedGrid = document.getElementById('included-grid');
        if (includedGrid && this.destination.included) {
            includedGrid.innerHTML = this.destination.included.map(item => `
                <div class="included-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${item}</span>
                </div>
            `).join('');
        }
    }

    renderItinerary() {
        const itineraryTimeline = document.getElementById('itinerary-timeline');
        if (itineraryTimeline && this.destination.itinerary) {
            itineraryTimeline.innerHTML = this.destination.itinerary.map(day => `
                <div class="itinerary-day">
                    <div class="day-header">
                        <span class="day-number">${day.day}</span>
                    </div>
                    <div class="day-activities">
                        ${day.activities.map(activity => `
                            <div class="activity">
                                <div class="activity-time">${activity.time}</div>
                                <div class="activity-details">
                                    <h4>${activity.title}</h4>
                                    <p>${activity.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    updateWishlistButton() {
        const wishlistBtn = document.getElementById('detail-wishlist-btn');
        if (wishlistBtn && window.wishlistSystem) {
            const isInWishlist = window.wishlistSystem.isInWishlist(this.destination.id, 'destination');
            const icon = wishlistBtn.querySelector('i');
            
            if (isInWishlist) {
                icon.className = 'fas fa-heart';
                wishlistBtn.classList.add('in-wishlist');
            } else {
                icon.className = 'far fa-heart';
                wishlistBtn.classList.remove('in-wishlist');
            }
        }
    }

    setupBookingWidget() {
        const bookingWidget = document.getElementById('booking-widget');
        if (bookingWidget) {
            bookingWidget.addEventListener('submit', (e) => this.handleBooking(e));
            
            // Update price when dates change
            const checkinInput = document.getElementById('sidebar-checkin');
            const checkoutInput = document.getElementById('sidebar-checkout');
            const travelersInput = document.getElementById('sidebar-travelers');
            
            [checkinInput, checkoutInput, travelersInput].forEach(input => {
                input.addEventListener('change', () => this.updatePriceBreakdown());
            });
            
            // Set minimum dates
            const today = new Date().toISOString().split('T')[0];
            checkinInput.min = today;
            checkoutInput.min = today;
            
            // Initial price update
            this.updatePriceBreakdown();
        }
    }

    updatePriceBreakdown() {
        const checkin = document.getElementById('sidebar-checkin').value;
        const checkout = document.getElementById('sidebar-checkout').value;
        const travelers = parseInt(document.getElementById('sidebar-travelers').value);

        if (checkin && checkout) {
            const nights = this.calculateNights(checkin, checkout);
            const basePrice = this.destination.price * nights * travelers;
            const taxes = basePrice * 0.1;
            const serviceFee = 25;
            const total = basePrice + taxes + serviceFee;

            document.getElementById('base-price').textContent = `$${basePrice}`;
            document.getElementById('taxes-price').textContent = `$${taxes.toFixed(2)}`;
            document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
        }
    }

    calculateNights(checkin, checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const diffTime = Math.abs(checkoutDate - checkinDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    handleBooking(e) {
        e.preventDefault();
        
        if (!window.authSystem?.isAuthenticated()) {
            window.authSystem.showLoginModal();
            window.authSystem.showLoginError('Please login to book this destination');
            return;
        }

        const formData = new FormData(e.target);
        const checkin = formData.get('checkin');
        const checkout = formData.get('checkout');
        const travelers = formData.get('travelers');

        if (!checkin || !checkout) {
            this.showError('Please select check-in and check-out dates');
            return;
        }

        // Redirect to booking page
        const params = new URLSearchParams({
            destinationId: this.destination.id,
            destination: this.destination.name,
            price: this.destination.price,
            image: this.destination.images[0],
            checkin: checkin,
            checkout: checkout,
            travelers: travelers
        });

        window.location.href = `booking.html?${params.toString()}`;
    }

    initializeMap() {
        if (!this.destination?.location) return;

        const map = L.map('mini-map').setView([this.destination.location.lat, this.destination.location.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        L.marker([this.destination.location.lat, this.destination.location.lng])
            .addTo(map)
            .bindPopup(`<strong>${this.destination.name}</strong><br>${this.destination.address}`)
            .openPopup();
    }

    renderReviews() {
        if (window.reviewsSystem && this.destination) {
            window.reviewsSystem.renderReviews(this.destination.id, 'destination');
        }
    }

    loadSimilarDestinations() {
        const container = document.getElementById('similar-destinations');
        if (!container) return;

        // Get similar destinations (excluding current one)
        const similarDestinations = this.getSimilarDestinations();
        
        if (similarDestinations.length === 0) {
            container.innerHTML = '<p>No similar destinations found.</p>';
            return;
        }

        container.innerHTML = similarDestinations.map(dest => `
            <div class="destination-card">
                <div class="destination-image">
                    <img src="${dest.images[0]}" alt="${dest.name}">
                    <div class="destination-overlay">
                        <div class="destination-price">From $${dest.price}</div>
                    </div>
                </div>
                <div class="destination-content">
                    <h3>${dest.name}</h3>
                    <p>${dest.description.substring(0, 100)}...</p>
                    <div class="destination-meta">
                        <span><i class="fas fa-star"></i> ${dest.rating}</span>
                        <span><i class="fas fa-clock"></i> 7 Days</span>
                    </div>
                    <a href="destination-detail.html?id=${dest.id}" class="btn-primary btn-full">
                        View Details
                    </a>
                </div>
            </div>
        `).join('');
    }

    getSimilarDestinations() {
        // In a real app, this would be an API call based on destination type, price range, etc.
        // For demo, we'll return some sample destinations
        return [
            {
                id: 'd2',
                name: 'Paris, France',
                description: 'The city of love with iconic landmarks and cuisine',
                price: 1199,
                rating: 4.9,
                images: ['https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
            },
            {
                id: 'd3',
                name: 'Tokyo, Japan',
                description: 'Modern metropolis with rich culture and technology',
                price: 1499,
                rating: 4.7,
                images: ['https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
            }
        ].filter(dest => dest.id !== this.destination.id);
    }

    setupEventListeners() {
        // Book now button
        document.getElementById('book-now-btn').addEventListener('click', () => {
            document.getElementById('booking-widget').scrollIntoView({ behavior: 'smooth' });
        });

        // Wishlist button
        document.getElementById('detail-wishlist-btn').addEventListener('click', () => {
            if (window.wishlistSystem) {
                window.wishlistSystem.toggleWishlistItem(this.destination.id, 'destination', 
                    document.getElementById('detail-wishlist-btn'));
            }
        });

        // Share button
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareDestination();
        });

        // Write review button
        document.getElementById('write-review-btn').addEventListener('click', () => {
            this.showReviewModal();
        });

        // Review modal
        const reviewModal = document.getElementById('review-modal');
        const closeModal = reviewModal.querySelector('.close-modal');
        
        closeModal.addEventListener('click', () => {
            reviewModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }

    shareDestination() {
        if (navigator.share) {
            navigator.share({
                title: this.destination.name,
                text: `Check out ${this.destination.name} on travl!`,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard();
            });
        } else {
            this.copyToClipboard();
        }
    }

    copyToClipboard() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Could not copy link', 'error');
        });
    }

    showReviewModal() {
        if (!window.authSystem?.isAuthenticated()) {
            window.authSystem.showLoginModal();
            window.authSystem.showLoginError('Please login to write a review');
            return;
        }

        document.getElementById('review-item-id').value = this.destination.id;
        document.getElementById('review-modal').style.display = 'block';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize destination detail page
document.addEventListener('DOMContentLoaded', () => {
    new DestinationDetail();
});