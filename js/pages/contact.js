// Contact page functionality
class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Contact form submission
        document.getElementById('contact-form').addEventListener('submit', (e) => this.handleContactSubmit(e));
        
        // Phone number click
        document.querySelectorAll('.contact-method').forEach(method => {
            const phoneElement = method.querySelector('p');
            if (phoneElement && phoneElement.textContent.includes('+1')) {
                method.style.cursor = 'pointer';
                method.addEventListener('click', () => {
                    this.handlePhoneClick('+1 (555) 123-4567');
                });
            }
        });
    }

    handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Get form values
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            urgency: formData.get('urgency'),
            timestamp: new Date().toISOString()
        };
        
        // Validate form
        if (!this.validateContactForm(contactData)) {
            return;
        }
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.processContactForm(contactData);
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Reset form
            e.target.reset();
        }, 2000);
    }

    validateContactForm(data) {
        // Basic validation
        if (!data.name.trim()) {
            this.showFormError('Please enter your name');
            return false;
        }
        
        if (!data.email.trim()) {
            this.showFormError('Please enter your email address');
            return false;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showFormError('Please enter a valid email address');
            return false;
        }
        
        if (!data.subject.trim()) {
            this.showFormError('Please enter a subject');
            return false;
        }
        
        if (!data.message.trim()) {
            this.showFormError('Please enter your message');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    processContactForm(data) {
        // In a real application, this would send the data to a server
        console.log('Contact form submitted:', data);
        
        // Show success message
        this.showFormSuccess('Thank you for your message! We\'ll get back to you within 24 hours.');
        
        // Store in localStorage for demo purposes
        this.storeContactSubmission(data);
    }

    storeContactSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('travl_contact_submissions')) || [];
        submissions.push(data);
        localStorage.setItem('travl_contact_submissions', JSON.stringify(submissions));
    }

    handlePhoneClick(phoneNumber) {
        // In a real app, this would initiate a phone call
        if (confirm(`Call ${phoneNumber}?`)) {
            console.log(`Initiating call to: ${phoneNumber}`);
            // window.location.href = `tel:${phoneNumber}`;
        }
    }

    showFormError(message) {
        this.showNotification(message, 'error');
    }

    showFormSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.form-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-color)' : '#dc2626'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Initialize contact page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactPage();
});