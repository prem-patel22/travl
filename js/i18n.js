// Internationalization System
class I18n {
    constructor() {
        this.currentLang = 'en';
        this.fallbackLang = 'en';
        this.translations = {};
        this.availableLangs = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'zh', name: '中文', flag: '🇨🇳' }
        ];
        this.currencyRates = {
            'en': { code: 'USD', symbol: '$', rate: 1 },
            'es': { code: 'USD', symbol: '$', rate: 1 },
            'fr': { code: 'EUR', symbol: '€', rate: 0.85 },
            'de': { code: 'EUR', symbol: '€', rate: 0.85 },
            'zh': { code: 'CNY', symbol: '¥', rate: 6.45 }
        };
        this.init();
    }

    async init() {
        await this.loadLanguage(this.getSavedLanguage());
        this.setupLanguageSelector();
        this.setupCurrencyConversion();
    }

    getSavedLanguage() {
        return localStorage.getItem('travl_language') || 
               navigator.language.split('-')[0] || 
               this.fallbackLang;
    }

    async loadLanguage(langCode) {
        try {
            if (!this.availableLangs.some(lang => lang.code === langCode)) {
                langCode = this.fallbackLang;
            }

            const response = await fetch(`/locales/${langCode}.json`);
            if (!response.ok) {
                throw new Error(`Language file not found: ${langCode}`);
            }

            this.translations[langCode] = await response.json();
            this.currentLang = langCode;
            localStorage.setItem('travl_language', langCode);
            
            // Update HTML lang attribute
            document.documentElement.lang = langCode;
            
            // Trigger translation update
            this.updatePageTranslations();
            
            console.log(`Language loaded: ${langCode}`);
        } catch (error) {
            console.error('Failed to load language:', error);
            // Fallback to English
            if (langCode !== this.fallbackLang) {
                await this.loadLanguage(this.fallbackLang);
            }
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                // Fallback to English
                value = this.getFallbackTranslation(key);
                break;
            }
        }
        
        if (value && typeof value === 'string') {
            return this.interpolate(value, params);
        }
        
        return key; // Return key if translation not found
    }

    getFallbackTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.fallbackLang];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) return undefined;
        }
        
        return value;
    }

    interpolate(text, params) {
        return text.replace(/{(\w+)}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    updatePageTranslations() {
        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.getParamsFromElement(element);
            const translation = this.t(key, params);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            document.title = this.t(titleElement.getAttribute('data-i18n'));
        }

        // Update meta descriptions
        document.querySelectorAll('meta[data-i18n]').forEach(meta => {
            const key = meta.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                meta.setAttribute('content', translation);
            }
        });

        // Trigger custom event for dynamic content
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    getParamsFromElement(element) {
        const params = {};
        const paramAttributes = element.getAttribute('data-i18n-params');
        
        if (paramAttributes) {
            try {
                Object.assign(params, JSON.parse(paramAttributes));
            } catch (e) {
                console.error('Invalid i18n params:', paramAttributes);
            }
        }
        
        return params;
    }

    setupLanguageSelector() {
        // Create language selector if it doesn't exist
        if (!document.getElementById('language-selector')) {
            this.createLanguageSelector();
        }
        
        // Update existing selector
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.innerHTML = this.generateLanguageOptions();
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    createLanguageSelector() {
        const selector = document.createElement('select');
        selector.id = 'language-selector';
        selector.className = 'language-selector';
        selector.innerHTML = this.generateLanguageOptions();
        selector.value = this.currentLang;
        
        selector.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Add to header if it exists
        const headerActions = document.querySelector('.nav-actions');
        if (headerActions) {
            headerActions.appendChild(selector);
        }
    }

    generateLanguageOptions() {
        return this.availableLangs.map(lang => 
            `<option value="${lang.code}" ${lang.code === this.currentLang ? 'selected' : ''}>
                ${lang.flag} ${lang.name}
            </option>`
        ).join('');
    }

    async changeLanguage(langCode) {
        await this.loadLanguage(langCode);
        
        // Show loading indicator
        this.showLanguageLoading();
        
        // Update currency if needed
        this.updateCurrency();
        
        // Notify other systems
        if (window.bookingSystem) {
            window.bookingSystem.onLanguageChange();
        }
    }

    showLanguageLoading() {
        const notification = document.createElement('div');
        notification.className = 'language-loading';
        notification.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <span>${this.t('common.loading')}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    }

    setupCurrencyConversion() {
        this.currentCurrency = this.currencyRates[this.currentLang];
        this.updateCurrency();
    }

    updateCurrency() {
        this.currentCurrency = this.currencyRates[this.currentLang];
        
        // Update currency displays
        document.querySelectorAll('[data-currency]').forEach(element => {
            const amount = parseFloat(element.getAttribute('data-currency'));
            if (!isNaN(amount)) {
                const converted = this.convertCurrency(amount);
                element.textContent = converted;
            }
        });

        // Update currency symbol in price displays
        document.querySelectorAll('.price-symbol').forEach(element => {
            element.textContent = this.currentCurrency.symbol;
        });
    }

    convertCurrency(amount) {
        const converted = amount * this.currentCurrency.rate;
        return this.formatCurrency(converted);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat(this.getLocale(), {
            style: 'currency',
            currency: this.currentCurrency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    getLocale() {
        const locales = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'zh': 'zh-CN'
        };
        return locales[this.currentLang] || 'en-US';
    }

    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return new Date(date).toLocaleDateString(
            this.getLocale(), 
            { ...defaultOptions, ...options }
        );
    }

    formatNumber(number) {
        return new Intl.NumberFormat(this.getLocale()).format(number);
    }

    // RTL (Right-to-Left) language support
    isRTL() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLang);
    }

    updateTextDirection() {
        document.body.dir = this.isRTL() ? 'rtl' : 'ltr';
    }

    // Pluralization support
    pluralize(key, count) {
        const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
        return this.t(pluralKey, { count }) || this.t(key, { count });
    }

    // Get current language info
    getCurrentLanguage() {
        return this.availableLangs.find(lang => lang.code === this.currentLang);
    }

    // Get all available languages
    getAvailableLanguages() {
        return this.availableLangs;
    }

    // Add dynamic translation (for user-generated content)
    addDynamicTranslation(key, translations) {
        if (!this.translations[this.currentLang]) {
            this.translations[this.currentLang] = {};
        }
        
        const keys = key.split('.');
        let current = this.translations[this.currentLang];
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = translations;
    }
}

// Global i18n instance
window.i18n = new I18n();

// Helper function for easy translation
window.t = (key, params) => window.i18n.t(key, params);