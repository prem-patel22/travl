// Wishlist System
class WishlistSystem {
    constructor() {
        this.wishlist = [];
        this.init();
    }

    init() {
        this.loadWishlist();
        this.setupEventListeners();
    }

    loadWishlist() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (currentUser && currentUser.wishlist) {
            this.wishlist = currentUser.wishlist;
        } else {
            this.wishlist = JSON.parse(localStorage.getItem('travl_wishlist')) || [];
        }
    }

    setupEventListeners() {
        // Global click handler for wishlist buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-wishlist') || e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                const button = e.target.closest('.add-wishlist') || e.target.closest('.wishlist-btn');
                const itemId = button.getAttribute('data-id');
                const itemType = button.getAttribute('data-type') || 'destination';
                
                this.toggleWishlistItem(itemId, itemType, button);
            }
        });
    }

    toggleWishlistItem(itemId, itemType, button) {
        const existingIndex = this.wishlist.findIndex(item => item.id === itemId && item.type === itemType);
        
        if (existingIndex > -1) {
            this.removeFromWishlist(itemId, itemType);
            this.updateButtonState(button, false);
            this.showNotification('Removed from wishlist', 'info');
        } else {
            this.addToWishlist(itemId, itemType);
            this.updateButtonState(button, true);
            this.showNotification('Added to wishlist', 'success');
        }
        
        this.saveWishlist();
        this.updateWishlistCounter();
    }

    addToWishlist(itemId, itemType) {
        const item = this.getItemDetails(itemId, itemType);
        if (item) {
            this.wishlist.push({
                id: itemId,
                type: itemType,
                name: item.name,
                image: item.image,
                price: item.price,
                rating: item.rating,
                addedAt: new Date().toISOString()
            });
        }
    }

    removeFromWishlist(itemId, itemType) {
        this.wishlist = this.wishlist.filter(item => 
            !(item.id === itemId && item.type === itemType)
        );
    }

    getItemDetails(itemId, itemType) {
        // This would typically come from your data source
        // For demo, we'll use a simple lookup
        const searchData = window.advancedSearch?.searchData || [];
        return searchData.find(item => item.id === itemId && item.type === itemType);
    }

    isInWishlist(itemId, itemType) {
        return this.wishlist.some(item => item.id === itemId && item.type === itemType);
    }

    updateButtonState(button, isInWishlist) {
        const icon = button.querySelector('i');
        if (icon) {
            if (isInWishlist) {
                icon.className = 'fas fa-heart';
                button.classList.add('in-wishlist');
            } else {
                icon.className = 'far fa-heart';
                button.classList.remove('in-wishlist');
            }
        }
    }

    updateWishlistCounter() {
        const counters = document.querySelectorAll('.wishlist-count');
        counters.forEach(counter => {
            counter.textContent = this.wishlist.length;
            counter.style.display = this.wishlist.length > 0 ? 'inline' : 'none';
        });
    }

    saveWishlist() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (currentUser) {
            currentUser.wishlist = this.wishlist;
            window.authSystem.saveUsers();
        } else {
            localStorage.setItem('travl_wishlist', JSON.stringify(this.wishlist));
        }
    }

    getWishlist() {
        return this.wishlist;
    }

    clearWishlist() {
        this.wishlist = [];
        this.saveWishlist();
        this.updateWishlistCounter();
        this.showNotification('Wishlist cleared', 'info');
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

    // Render wishlist items
    renderWishlist(container) {
        if (!container) return;

        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding destinations and hotels you love!</p>
                    <a href="destinations.html" class="btn-primary">Explore Destinations</a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.wishlist.map(item => `
            <div class="wishlist-item card">
                <div class="card-image">
                    <img src="${item.image}" alt="${item.name}">
                    <button class="wishlist-btn remove-wishlist" data-id="${item.id}" data-type="${item.type}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="card-badge">${item.type}</div>
                </div>
                <div class="card-body">
                    <h3>${item.name}</h3>
                    <div class="item-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${item.rating}
                        </span>
                        <span class="price">
                            From $${item.price}
                        </span>
                    </div>
                    <p>Added ${this.formatDate(item.addedAt)}</p>
                </div>
                <div class="card-footer">
                    <button class="btn-primary view-item" data-id="${item.id}" data-type="${item.type}">
                        View Details
                    </button>
                    <button class="btn-outline book-now" data-id="${item.id}" data-type="${item.type}">
                        Book Now
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.remove-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = button.getAttribute('data-id');
                const itemType = button.getAttribute('data-type');
                this.removeFromWishlist(itemId, itemType);
                this.saveWishlist();
                this.updateWishlistCounter();
                this.renderWishlist(container);
                this.showNotification('Removed from wishlist', 'info');
            });
        });

        container.querySelectorAll('.view-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = button.getAttribute('data-id');
                const itemType = button.getAttribute('data-type');
                this.viewItem(itemId, itemType);
            });
        });

        container.querySelectorAll('.book-now').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = button.getAttribute('data-id');
                const itemType = button.getAttribute('data-type');
                this.bookItem(itemId, itemType);
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    viewItem(itemId, itemType) {
        if (itemType === 'destination') {
            window.location.href = `destination-detail.html?id=${itemId}`;
        } else {
            // Show item details in modal
            const item = this.getItemDetails(itemId, itemType);
            if (item) {
                this.showItemModal(item);
            }
        }
    }

    bookItem(itemId, itemType) {
        const item = this.getItemDetails(itemId, itemType);
        if (item) {
            // Redirect to booking page with item details
            const params = new URLSearchParams({
                destinationId: itemId,
                destination: item.name,
                price: item.price,
                image: item.image
            });
            window.location.href = `booking.html?${params.toString()}`;
        }
    }

    showItemModal(item) {
        // Implementation for showing item modal
        console.log('Showing item modal:', item);
    }
}

// Initialize wishlist system
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistSystem = new WishlistSystem();
    window.wishlistSystem.updateWishlistCounter();
});