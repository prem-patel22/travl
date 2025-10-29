// Home page specific functionality
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupSearchTabs();
        this.setupDateInputs();
        this.setupSearchForm();
        this.initializeAnimations();
    }

    setupSearchTabs() {
        const tabs = document.querySelectorAll('.search-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Update search form based on selected tab
                this.updateSearchForm(tab.textContent.trim());
            });
        });
    }

    updateSearchForm(tabType) {
        const searchForm = document.querySelector('.search-form');
        // You can customize the form based on tab type
        console.log(`Switched to ${tabType} search`);
    }

    setupDateInputs() {
        const dateInputs = document.querySelectorAll('input[type="text"][onfocus*="date"]');
        
        dateInputs.forEach(input => {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            input.addEventListener('focus', function() {
                this.type = 'date';
                this.min = today;
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.type = 'text';
                }
            });
        });
    }

    setupSearchForm() {
        const searchForm = document.querySelector('.search-form');
        const searchButton = document.querySelector('.btn-search');

        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Allow Enter key to submit form
        searchForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });
    }

    handleSearch() {
        const destination = document.querySelector('.search-form input[type="text"]').value;
        const checkin = document.querySelector('.search-form input[type="date"]').value;
        const checkout = document.querySelectorAll('.search-form input[type="date"]')[1].value;
        const travelers = document.querySelector('.search-form select').value;

        if (!destination) {
            this.showSearchError('Please enter a destination');
            return;
        }

        // Simulate search process
        this.showSearchLoading();
        
        setTimeout(() => {
            this.hideSearchLoading();
            // Redirect to destinations page with search parameters
            window.location.href = `pages/destinations.html?search=${encodeURIComponent(destination)}`;
        }, 1500);
    }

    showSearchError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.marginTop = '1rem';
        
        const searchBox = document.querySelector('.search-box');
        searchBox.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showSearchLoading() {
        const searchButton = document.querySelector('.btn-search');
        const originalText = searchButton.innerHTML;
        
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchButton.disabled = true;
        
        // Store original content to restore later
        searchButton.setAttribute('data-original', originalText);
    }

    hideSearchLoading() {
        const searchButton = document.querySelector('.btn-search');
        const originalText = searchButton.getAttribute('data-original');
        
        if (originalText) {
            searchButton.innerHTML = originalText;
            searchButton.disabled = false;
        }
    }

    initializeAnimations() {
        // Initialize any home page specific animations
        this.animateOnScroll();
    }

    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `fadeInUp 0.6s ease ${entry.target.dataset.delay || '0s'} both`;
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .destination-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.dataset.delay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});