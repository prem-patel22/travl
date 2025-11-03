// Main JavaScript file - Global functionality

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('travl website loaded');
    
    // Wait for i18n to initialize
    await window.i18n?.initialized;
    
    // Register Service Worker for PWA
    registerServiceWorker();
    
    // Global event listeners and initialization
    initializeApp();
});

function initializeApp() {
    setupGlobalEventListeners();
    loadUserPreferences();
    checkAuthenticationStatus();
    initializeGlobalComponents();
    
    // Listen for language changes
    window.addEventListener('languageChanged', (event) => {
        updateContentForLanguage(event.detail.language);
    });
}

function updateContentForLanguage(language) {
    // Update any dynamic content that's not covered by data-i18n
    console.log('Language changed to:', language);
    
    // Update currency displays
    updateCurrencyDisplays();
    
    // Update date formats
    updateDateDisplays();
    
    // Refresh any dynamic content
    refreshDynamicContent();
}

function updateCurrencyDisplays() {
    // Update all currency displays
    document.querySelectorAll('[data-currency]').forEach(element => {
        const amount = parseFloat(element.getAttribute('data-currency'));
        const currency = element.getAttribute('data-currency-code') || 'USD';
        element.textContent = window.i18n?.formatCurrency?.(amount, currency) || window.travlUtils.formatCurrency(amount, currency);
    });
}

function updateDateDisplays() {
    // Update all date displays
    document.querySelectorAll('[data-date]').forEach(element => {
        const dateString = element.getAttribute('data-date');
        const options = JSON.parse(element.getAttribute('data-date-options') || '{}');
        element.textContent = window.i18n?.formatDate?.(dateString, options) || window.travlUtils.formatDate(dateString);
    });
}

function refreshDynamicContent() {
    // Refresh any content that was dynamically loaded
    if (window.authSystem) {
        window.authSystem.updateUI();
    }
    
    // Update any other dynamic components
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    dynamicElements.forEach(element => {
        const dynamicType = element.getAttribute('data-dynamic');
        // Handle different types of dynamic content
        switch(dynamicType) {
            case 'user-greeting':
                if (window.authSystem?.currentUser) {
                    element.textContent = window.i18n?.t?.('common.welcome_user', { name: window.authSystem.currentUser.name }) || `Welcome, ${window.authSystem.currentUser.name}`;
                }
                break;
            // Add more dynamic content types as needed
        }
    });
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
    
    // Load language preference
    const savedLanguage = localStorage.getItem('travl_language');
    if (savedLanguage && window.i18n) {
        window.i18n.changeLanguage(savedLanguage);
    }
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
    
    // Initialize language switcher if i18n is available
    if (window.i18n) {
        initializeLanguageSwitcher();
    }
}

function initializeLanguageSwitcher() {
    // Create language switcher component
    const switcherContainer = document.getElementById('language-switcher-container');
    if (!switcherContainer) return;
    
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' }
    ];
    
    const currentLang = window.i18n.currentLanguage;
    const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
    
    const switcherHTML = `
        <div class="language-switcher">
            <button class="language-current" id="language-current-btn">
                <span class="language-flag">${currentLanguage.flag}</span>
                <span class="language-name">${currentLanguage.name}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="language-dropdown" id="language-dropdown">
                ${languages.map(lang => `
                    <button class="language-option ${lang.code === currentLang ? 'active' : ''}" 
                            data-lang="${lang.code}">
                        <span class="language-flag">${lang.flag}</span>
                        <span class="language-name">${lang.name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    switcherContainer.innerHTML = switcherHTML;
    
    // Add event listeners
    document.getElementById('language-current-btn')?.addEventListener('click', toggleLanguageDropdown);
    
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const langCode = e.currentTarget.getAttribute('data-lang');
            window.i18n.changeLanguage(langCode);
            closeLanguageDropdown();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-switcher')) {
            closeLanguageDropdown();
        }
    });
}

function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function closeLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
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
            const loadingText = window.i18n?.t?.('common.loading') || 'Loading...';
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
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

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});