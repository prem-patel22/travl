// Main JavaScript file - Global functionality

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('travl website loaded');
    
    // Global event listeners and initialization
    initializeApp();
});

function initializeApp() {
    setupGlobalEventListeners();
    loadUserPreferences();
    checkAuthenticationStatus();
    initializeGlobalComponents();
}

function setupGlobalEventListeners() {
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (window.authSystem) {
                window.authSystem.hideAllModals();
            }
        }
    });

    // Global click handler for dynamic elements
    document.addEventListener('click', (e) => {
        // Handle external links
        if (e.target.matches('a[href^="http"]') || e.target.closest('a[href^="http"]')) {
            const link = e.target.href ? e.target : e.target.closest('a');
            if (!link.href.includes(window.location.hostname)) {
                e.preventDefault();
                window.open(link.href, '_blank', 'noopener noreferrer');
            }
        }
    });
}

function loadUserPreferences() {
    // Load user preferences from localStorage
    const theme = localStorage.getItem('travl_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function checkAuthenticationStatus() {
    // Check if user is authenticated on protected pages
    const currentPage = window.location.pathname;
    const protectedPages = ['/pages/bookings.html', '/pages/profile.html'];
    
    if (protectedPages.some(page => currentPage.includes(page)) && 
        (!window.authSystem || !window.authSystem.isAuthenticated())) {
        window.location.href = '../index.html';
    }
}

function initializeGlobalComponents() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize loading states
    initializeLoadingStates();
}

function initializeTooltips() {
    // Simple tooltip implementation
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = e.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--text-dark);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius-sm);
        font-size: 0.8rem;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        e.target._tooltip = null;
    }
}

function initializeLoadingStates() {
    // Add loading states to all buttons with async actions
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-loading]');
        if (button && !button.disabled) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            button.disabled = true;
            
            // Store original content
            button.setAttribute('data-original', originalText);
            
            // Auto reset after 5 seconds (safety)
            setTimeout(() => {
                if (button.disabled) {
                    resetButton(button);
                }
            }, 5000);
        }
    });
}

function resetButton(button) {
    const originalText = button.getAttribute('data-original');
    if (originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Global utility functions
window.travlUtils = {
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
};

// Global function to check if user can access protected content
function requireAuth() {
    if (!window.authSystem?.isAuthenticated()) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});