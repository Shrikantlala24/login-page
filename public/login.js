// Wait for page to fully load before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get references to HTML elements we need to interact with
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Add event listener for form submission
    loginForm.addEventListener('submit', handleLogin);
    
    /**
     * Handle login form submission
     * @param {Event} event - The form submit event
     */
    async function handleLogin(event) {
        // Prevent default form behavior (page refresh)
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        
        // Basic client-side validation
        if (!username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        hideMessage();
        
        try {
            // Send login request to server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            // Parse response as JSON
            const data = await response.json();
            
            if (data.success) {
                // Login successful
                showMessage(data.message, 'success');
                
                // Redirect to welcome page after short delay
                setTimeout(() => {
                    window.location.href = data.redirectTo || '/welcome';
                }, 1000);
            } else {
                // Login failed
                showMessage(data.message, 'error');
            }
        } catch (error) {
            // Network or other error
            console.error('Login error:', error);
            showMessage('Login failed. Please check your connection and try again.', 'error');
        } finally {
            // Always hide loading state
            setLoadingState(false);
        }
    }
    
    /**
     * Show or hide loading state on submit button
     * @param {boolean} isLoading - Whether to show loading state
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
     * @param {string} message - Message text
     * @param {string} type - Message type ('success' or 'error')
     */
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(hideMessage, 3000);
        }
    }
    
    /**
     * Hide message div
     */
    function hideMessage() {
        messageDiv.style.display = 'none';
    }
});