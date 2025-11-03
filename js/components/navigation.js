// Navigation functionality
class Navigation {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupMobileMenu();
        this.setupActiveLinks();
        this.setupScrollEffects();
        this.addTestPageToNav(); // Add test page to navigation
    }
    
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    setupActiveLinks() {
        // Set active state for current page navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupScrollEffects() {
        const header = document.getElementById('main-header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            }
        });
    }

    // Add test page to navigation (temporarily)
    addTestPageToNav() {
        // Only add test page in development environment
        if (this.isDevelopment()) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && !document.querySelector('[href="pages/test-payment.html"]')) {
                const testItem = document.createElement('li');
                testItem.innerHTML = '<a href="pages/test-payment.html">Test Payments</a>';
                navMenu.appendChild(testItem);
                
                // Update active links after adding new item
                setTimeout(() => this.setupActiveLinks(), 0);
            }
        }
    }

    // Check if we're in development environment
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev-') ||
               window.location.hostname.includes('test-');
    }

    // Method to remove test page when going to production
    removeTestPageFromNav() {
        const testLink = document.querySelector('[href="pages/test-payment.html"]');
        if (testLink) {
            testLink.closest('li').remove();
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});