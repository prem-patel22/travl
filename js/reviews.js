// Reviews and Ratings System
class ReviewsSystem {
    constructor() {
        this.reviews = [];
        this.init();
    }

    init() {
        this.loadReviews();
        this.setupEventListeners();
    }

    loadReviews() {
        // Load reviews from localStorage or API
        this.reviews = JSON.parse(localStorage.getItem('travl_reviews')) || [];
        
        // Add sample reviews if none exist
        if (this.reviews.length === 0) {
            this.reviews = this.generateSampleReviews();
            this.saveReviews();
        }
    }

    generateSampleReviews() {
        return [
            {
                id: 'rev1',
                itemId: 'd1',
                itemType: 'destination',
                userId: 'user1',
                userName: 'Sarah Johnson',
                userAvatar: 'SJ',
                rating: 5,
                title: 'Amazing Bali Experience!',
                comment: 'Bali exceeded all our expectations. The beaches, culture, and people were incredible. Can\'t wait to go back!',
                date: '2024-01-15',
                helpful: 12,
                verified: true
            },
            {
                id: 'rev2',
                itemId: 'd1',
                itemType: 'destination',
                userId: 'user2',
                userName: 'Mike Chen',
                userAvatar: 'MC',
                rating: 4,
                title: 'Beautiful but crowded',
                comment: 'Bali is absolutely beautiful, but some areas were quite crowded. Still highly recommend visiting!',
                date: '2024-01-10',
                helpful: 8,
                verified: true
            },
            {
                id: 'rev3',
                itemId: 'd2',
                itemType: 'destination',
                userId: 'user3',
                userName: 'Emma Davis',
                userAvatar: 'ED',
                rating: 5,
                title: 'Paris in spring is magical',
                comment: 'The city of love truly lives up to its name. Every corner is picture-perfect.',
                date: '2024-02-01',
                helpful: 15,
                verified: true
            }
        ];
    }

    setupEventListeners() {
        // Review form submission
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
        }

        // Star rating interaction
        document.addEventListener('click', (e) => {
            if (e.target.closest('.star-rating-widget')) {
                this.handleStarRating(e);
            }
        });

        // Helpful votes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.helpful-btn')) {
                this.handleHelpfulVote(e);
            }
        });
    }

    handleReviewSubmit(e) {
        e.preventDefault();
        
        if (!window.authSystem?.isAuthenticated()) {
            this.showError('Please login to submit a review');
            return;
        }

        const formData = new FormData(e.target);
        const rating = parseInt(formData.get('rating'));
        const title = formData.get('title');
        const comment = formData.get('comment');
        const itemId = formData.get('itemId');
        const itemType = formData.get('itemType');

        if (!rating) {
            this.showError('Please select a rating');
            return;
        }

        const currentUser = window.authSystem.getCurrentUser();
        const review = {
            id: 'rev_' + Date.now().toString(36),
            itemId: itemId,
            itemType: itemType,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: this.getUserInitials(currentUser.name),
            rating: rating,
            title: title,
            comment: comment,
            date: new Date().toISOString().split('T')[0],
            helpful: 0,
            verified: true
        };

        this.addReview(review);
        e.target.reset();
        this.resetStarRating();
        this.showSuccess('Review submitted successfully!');
    }

    addReview(review) {
        this.reviews.push(review);
        this.saveReviews();
        this.renderReviews(review.itemId, review.itemType);
    }

    getUserInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }

    handleStarRating(e) {
        const star = e.target.closest('.star');
        if (!star) return;

        const widget = star.closest('.star-rating-widget');
        const stars = widget.querySelectorAll('.star');
        const rating = parseInt(star.getAttribute('data-rating'));
        
        // Update star display
        stars.forEach((s, index) => {
            if (index < rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });

        // Update hidden input
        const ratingInput = widget.querySelector('input[name="rating"]');
        if (ratingInput) {
            ratingInput.value = rating;
        }
    }

    resetStarRating() {
        document.querySelectorAll('.star-rating-widget').forEach(widget => {
            const stars = widget.querySelectorAll('.star');
            stars.forEach(star => star.classList.remove('active'));
            
            const ratingInput = widget.querySelector('input[name="rating"]');
            if (ratingInput) {
                ratingInput.value = '';
            }
        });
    }

    handleHelpfulVote(e) {
        const button = e.target.closest('.helpful-btn');
        const reviewId = button.getAttribute('data-review-id');
        
        // Check if user already voted
        const votedReviews = JSON.parse(localStorage.getItem('travl_voted_reviews')) || [];
        if (votedReviews.includes(reviewId)) {
            this.showError('You have already voted for this review');
            return;
        }

        // Update helpful count
        const review = this.reviews.find(rev => rev.id === reviewId);
        if (review) {
            review.helpful++;
            this.saveReviews();
            
            // Store vote
            votedReviews.push(reviewId);
            localStorage.setItem('travl_voted_reviews', JSON.stringify(votedReviews));
            
            // Update display
            const countElement = button.querySelector('.helpful-count');
            if (countElement) {
                countElement.textContent = review.helpful;
            }
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-check"></i> Helpful';
        }
    }

    getReviewsForItem(itemId, itemType) {
        return this.reviews.filter(review => 
            review.itemId === itemId && review.itemType === itemType
        );
    }

    getAverageRating(itemId, itemType) {
        const itemReviews = this.getReviewsForItem(itemId, itemType);
        if (itemReviews.length === 0) return 0;
        
        const total = itemReviews.reduce((sum, review) => sum + review.rating, 0);
        return total / itemReviews.length;
    }

    getRatingDistribution(itemId, itemType) {
        const itemReviews = this.getReviewsForItem(itemId, itemType);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        itemReviews.forEach(review => {
            distribution[review.rating]++;
        });
        
        return distribution;
    }

    renderReviews(itemId, itemType) {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        const reviews = this.getReviewsForItem(itemId, itemType);
        const averageRating = this.getAverageRating(itemId, itemType);
        const ratingDistribution = this.getRatingDistribution(itemId, itemType);
        const totalReviews = reviews.length;

        // Render rating summary
        const summaryHTML = `
            <div class="rating-summary">
                <div class="average-rating">
                    <div class="rating-number">${averageRating.toFixed(1)}</div>
                    <div class="stars">${this.renderStars(averageRating)}</div>
                    <div class="total-reviews">${totalReviews} reviews</div>
                </div>
                <div class="rating-breakdown">
                    ${[5, 4, 3, 2, 1].map(rating => `
                        <div class="rating-bar">
                            <span class="rating-label">${rating} star</span>
                            <div class="bar-container">
                                <div class="bar" style="width: ${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%"></div>
                            </div>
                            <span class="rating-count">${ratingDistribution[rating]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Render reviews list
        const reviewsHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="user-info">
                        <div class="user-avatar">${review.userAvatar}</div>
                        <div class="user-details">
                            <div class="user-name">${review.userName}</div>
                            <div class="review-date">${this.formatDate(review.date)}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(review.rating)}
                        ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    </div>
                </div>
                <div class="review-content">
                    <h4 class="review-title">${review.title}</h4>
                    <p class="review-comment">${review.comment}</p>
                </div>
                <div class="review-actions">
                    <button class="helpful-btn" data-review-id="${review.id}">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="helpful-count">${review.helpful}</span> Helpful
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = summaryHTML + reviewsHTML;

        // Add event listeners for helpful buttons
        container.querySelectorAll('.helpful-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleHelpfulVote(e));
        });
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    saveReviews() {
        localStorage.setItem('travl_reviews', JSON.stringify(this.reviews));
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
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

// Initialize reviews system
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsSystem = new ReviewsSystem();
});