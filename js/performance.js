// Performance Optimization System
class PerformanceOptimizer {
    constructor() {
        this.observedElements = new Set();
        this.imageCache = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupResourceHints();
        this.optimizeAnimations();
        this.setupCaching();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementInViewport(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px 50px 0px',
            threshold: 0.1
        });
    }

    observeElement(element, callback) {
        if (this.observedElements.has(element)) return;

        this.observedElements.add(element);
        element.setAttribute('data-observed', 'true');
        
        this.observer.observe(element);
        
        // Store callback for when element comes into view
        element._lazyCallback = callback;
    }

    handleElementInViewport(element) {
        if (element._lazyCallback) {
            element._lazyCallback();
            element._lazyCallback = null;
        }
        
        this.observer.unobserve(element);
    }

    // Image Lazy Loading
    setupLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach(img => {
            this.observeElement(img, () => {
                this.loadLazyImage(img);
            });
        });
    }

    loadLazyImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        
        img.src = src;
        if (srcset) img.srcset = srcset;
        
        img.classList.remove('lazy-load');
        img.classList.add('loaded');
        
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
    }

    // Progressive Image Loading
    loadProgressiveImage(container, imageUrl, placeholderUrl = null) {
        const img = new Image();
        
        // Show placeholder first
        if (placeholderUrl) {
            container.style.backgroundImage = `url('${placeholderUrl}')`;
            container.classList.add('progressive-loading');
        }
        
        img.onload = () => {
            container.style.backgroundImage = `url('${imageUrl}')`;
            container.classList.remove('progressive-loading');
            container.classList.add('progressive-loaded');
        };
        
        img.src = imageUrl;
    }

    // Resource Hints
    setupResourceHints() {
        // Preconnect to important domains
        this.addPreconnect('https://api.travl.com');
        this.addPreconnect('https://images.unsplash.com');
        
        // Preload critical resources
        this.addPreload('/css/critical.css', 'style');
        this.addPreload('/js/main.js', 'script');
    }

    addPreconnect(url) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    addPreload(href, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        document.head.appendChild(link);
    }

    // Animation Optimization
    optimizeAnimations() {
        // Use will-change for elements that will animate
        const animatedElements = document.querySelectorAll('.card, .btn-primary, .search-result');
        
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });
    }

    // Caching System
    setupCaching() {
        // Cache frequently accessed data
        this.setupDataCache();
        this.setupImageCache();
    }

    setupDataCache() {
        this.dataCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getCachedData(key, fetchFunction) {
        const cached = this.dataCache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const data = await fetchFunction();
        this.dataCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }

    setupImageCache() {
        // Simple image caching
        if ('caches' in window) {
            caches.open('travl-images').then(cache => {
                this.imageCache = cache;
            });
        }
    }

    // Bundle Splitting (simulated)
    async loadComponent(componentName) {
        const components = {
            'map': () => import('./map.js'),
            'booking': () => import('./booking.js'),
            'search': () => import('./search.js')
        };

        if (components[componentName]) {
            return await components[componentName]();
        }
        
        return null;
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorLCP();
        this.monitorFID();
        this.monitorCLS();
        
        // Custom metrics
        this.monitorSearchPerformance();
        this.monitorBookingPerformance();
    }

    monitorLCP() {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log('LCP:', lastEntry.startTime);
            this.reportMetric('LCP', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});
    }

    monitorFID() {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const fid = entry.processingStart - entry.startTime;
                console.log('FID:', fid);
                this.reportMetric('FID', fid);
            });
        }).observe({entryTypes: ['first-input']});
    }

    monitorCLS() {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    console.log('CLS:', clsValue);
                    this.reportMetric('CLS', clsValue);
                }
            }
        }).observe({entryTypes: ['layout-shift']});
    }

    monitorSearchPerformance() {
        const originalSearch = window.advancedSearch?.applyFilters;
        
        if (originalSearch) {
            window.advancedSearch.applyFilters = function(...args) {
                const startTime = performance.now();
                const result = originalSearch.apply(this, args);
                const duration = performance.now() - startTime;
                
                console.log('Search performance:', duration);
                window.performanceOptimizer.reportMetric('search_duration', duration);
                
                return result;
            };
        }
    }

    monitorBookingPerformance() {
        // Similar monitoring for booking flow
    }

    reportMetric(name, value) {
        // Send to analytics service
        if (window.gtag) {
            gtag('event', 'performance', {
                metric_name: name,
                metric_value: value
            });
        }
    }

    // Memory Management
    cleanup() {
        // Clean up observers
        this.observer?.disconnect();
        
        // Clear timeouts
        this.clearAllTimeouts();
        
        // Clean up cache periodically
        this.cleanupCache();
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.dataCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.dataCache.delete(key);
            }
        }
    }

    clearAllTimeouts() {
        // Get all timeout IDs and clear them
        let id = setTimeout(() => {}, 0);
        while (id--) {
            clearTimeout(id);
        }
    }

    // Progressive Web App Features
    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    // Offline Support
    setupOfflineSupport() {
        // Cache critical pages and assets
        if ('caches' in window) {
            caches.open('travl-critical').then(cache => {
                return cache.addAll([
                    '/',
                    '/css/style.css',
                    '/js/main.js',
                    '/offline.html'
                ]);
            });
        }
    }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    window.performanceOptimizer.setupLazyImages();
    window.performanceOptimizer.setupPerformanceMonitoring();
});