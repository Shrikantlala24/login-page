document.addEventListener('DOMContentLoaded', function() {
    const usernameSpan = document.getElementById('username');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const messageDiv = document.getElementById('message');
    const btnText = logoutBtn.querySelector('.btn-text');
    const btnLoading = logoutBtn.querySelector('.btn-loading');
    
    // Load user information when page loads
    loadUserInfo();
    
    // Add logout button event listener
    logoutBtn.addEventListener('click', handleLogout);
    
    /**
     * Load current user information from server
     */
    async function loadUserInfo() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.success) {
                // Display user information
                usernameSpan.textContent = data.user.username;
                userInfoSpan.textContent = data.user.username;
            } else {
                // User not logged in, redirect to login
                console.log('User not authenticated, redirecting...');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error loading user info:', error);
            showMessage('Error loading user information', 'error');
        }
    }
    
    /**
     * Handle logout button click
     */
    async function handleLogout() {
        setLoadingState(true);
        hideMessage();
        
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Logged out successfully', 'success');
                
                // Redirect to login page after short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showMessage('Logout failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showMessage('Logout failed. Please check your connection.', 'error');
        } finally {
            setLoadingState(false);
        }
    }
    
    /**
     * Show or hide loading state on logout button
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            logoutBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            logoutBtn.disabled = false;
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