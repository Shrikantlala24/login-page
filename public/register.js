document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Add event listener for form submission
    registerForm.addEventListener('submit', handleRegistration);
    
    // Add real-time password validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    
    /**
     * Handle registration form submission
     * @param {Event} event - The form submit event
     */
    async function handleRegistration(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(registerForm);
        const username = formData.get('username').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Client-side validation
        if (!validateForm(username, email, password, confirmPassword)) {
            return; // Validation failed, error message already shown
        }
        
        // Show loading state
        setLoadingState(true);
        hideMessage();
        
        try {
            // Send registration request to server
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Registration successful
                showMessage(data.message, 'success');
                
                // Clear form
                registerForm.reset();
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                // Registration failed
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Registration failed. Please check your connection and try again.', 'error');
        } finally {
            setLoadingState(false);
        }
    }
    
    /**
     * Validate form data on client side
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {string} password - Password
     * @param {string} confirmPassword - Password confirmation
     * @returns {boolean} - Whether validation passed
     */
    function validateForm(username, email, password, confirmPassword) {
        // Check if all fields are filled
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return false;
        }
        
        // Validate username length and characters
        if (username.length < 3) {
            showMessage('Username must be at least 3 characters long', 'error');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showMessage('Username can only contain letters, numbers, and underscores', 'error');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return false;
        }
        
        // Validate password strength
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return false;
        }
        
        // Check password match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return false;
        }
        
        return true;
    }
    
    /**
     * Real-time password match validation
     */
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
            confirmPasswordInput.style.borderColor = '#ef4444';
        } else {
            confirmPasswordInput.setCustomValidity('');
            confirmPasswordInput.style.borderColor = '#e5e7eb';
        }
    }
    
    /**
     * Show or hide loading state
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    /**
     * Display message to user
     */
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(hideMessage, 5000);
        }
    }
    
    /**
     * Hide message div
     */
    function hideMessage() {
        messageDiv.style.display = 'none';
    }
});