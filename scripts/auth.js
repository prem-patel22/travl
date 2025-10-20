document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authLoading = document.getElementById('authLoading');
    const authSuccess = document.getElementById('authSuccess');
    const switchLinks = document.querySelectorAll('.switch-link');
    
    // Initialize authentication system
    AuthManager.initializeUsers();

    // Check URL parameters for form type and show appropriate form
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'login') {
        showForm('login');
    } else {
        showForm('signup'); // Default to signup
    }

    // Form switching
    switchLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const formType = this.getAttribute('data-form');
            showForm(formType);
            
            // Update URL without reload
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('action', formType);
            window.history.replaceState({}, '', newUrl);
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Basic validation
        if (!email || !password) {
            showError(loginForm, 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            showError(loginForm, 'Please enter a valid email address');
            return;
        }

        // Check if user exists and credentials are correct
        const user = AuthManager.validateUser(email, password);
        
        if (user) {
            showLoading();
            // Successful login
            AuthManager.login(user);
            
            // Show success and redirect
            setTimeout(() => {
                showSuccess();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }, 1000);
        } else {
            // Check if user exists but password is wrong
            if (AuthManager.userExists(email)) {
                showError(loginForm, 'Incorrect password. Please try again.');
            } else {
                showError(loginForm, 'No account found with this email. Please sign up first.');
            }
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Signup form submitted');
        
        const formData = {
            name: document.getElementById('signupName').value.trim(),
            email: document.getElementById('signupEmail').value.trim().toLowerCase(),
            password: document.getElementById('signupPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            showError(signupForm, 'Please fill in all fields');
            return;
        }

        if (!validateEmail(formData.email)) {
            showError(signupForm, 'Please enter a valid email address');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showError(signupForm, 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            showError(signupForm, 'Password must be at least 6 characters');
            return;
        }

        // Check terms agreement
        const termsCheckbox = signupForm.querySelector('input[name="terms"]');
        if (!termsCheckbox.checked) {
            showError(signupForm, 'Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        // Check if user already exists
        if (AuthManager.userExists(formData.email)) {
            showError(signupForm, 'An account with this email already exists. Please log in instead.');
            return;
        }

        // Register new user
        const newUser = AuthManager.registerUser(formData);
        
        if (newUser) {
            showLoading();
            // Auto-login after successful registration
            AuthManager.login(newUser);
            
            // Show success and redirect
            setTimeout(() => {
                showSuccess();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }, 1000);
        } else {
            showError(signupForm, 'Registration failed. Please try again.');
        }
    });

    // Password strength indicator
    const passwordInput = document.getElementById('signupPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrength(strength);
        });
    }

    function showForm(formType) {
        console.log('Showing form:', formType);
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        document.getElementById(`${formType}Form`).classList.add('active');
        
        // Clear any existing errors when switching forms
        clearErrors();
        
        // Reset forms when switching
        if (formType === 'login') {
            loginForm.reset();
        } else {
            signupForm.reset();
            updatePasswordStrength(0);
        }
        
        // Hide loading and success states
        authLoading.classList.remove('active');
        authSuccess.classList.remove('active');
    }

    function showLoading() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        authLoading.classList.add('active');
        authSuccess.classList.remove('active');
        clearErrors();
    }

    function showSuccess() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        authLoading.classList.remove('active');
        authSuccess.classList.add('active');
    }

    function showError(form, message) {
        clearErrors();
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Insert before the submit button
        const submitButton = form.querySelector('button[type="submit"]');
        form.insertBefore(errorElement, submitButton);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 5);
    }

    function updatePasswordStrength(strength) {
        const percentage = (strength / 5) * 100;
        
        // Clear and update strength bar
        strengthBar.innerHTML = '';
        const barFill = document.createElement('div');
        barFill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background: ${getStrengthColor(percentage)};
            border-radius: 2px;
            transition: all 0.3s ease;
        `;
        strengthBar.appendChild(barFill);
        
        strengthText.textContent = getStrengthText(strength);
        strengthText.style.color = getStrengthColor(percentage);
    }

    function getStrengthColor(percentage) {
        if (percentage < 40) return '#ef4444';
        if (percentage < 70) return '#f59e0b';
        return '#10b981';
    }

    function getStrengthText(strength) {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return texts[strength] || 'Very Weak';
    }
});