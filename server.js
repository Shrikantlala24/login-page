const express = require('express');
const session = require('express-session');
const path = require('path');
const { createUser, verifyUser } = require('./database');

// Create Express application
const app = express();
const PORT = 3000; // Port number where server will run

// Middleware setup (functions that process requests before they reach your routes)
app.use(express.json()); // Parse JSON data from requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public')); // Serve files from 'public' folder

// Session configuration (keeps users logged in)
app.use(session({
    secret: 'your-secret-key-change-this-in-production', // Used to encrypt session data
    resave: false, // Don't save session if nothing changed
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Session expires after 24 hours
    }
}));

// Routes (URL endpoints that handle different requests)

// Serve login page at root URL
app.get('/', (req, res) => {
    // If user is already logged in, redirect to welcome page
    if (req.session.userId) {
        return res.redirect('/welcome');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve registration page
app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/welcome');
    }
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve welcome page (only if logged in)
app.get('/welcome', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/'); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Handle user registration
app.post('/api/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters' 
        });
    }
    
    // Create user in database
    createUser(username, email, password, (err, user) => {
        if (err) {
            console.error('Registration error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username or email already exists' 
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: 'Registration failed. Please try again.' 
            });
        }
        
        // Registration successful
        res.json({ 
            success: true, 
            message: 'Registration successful! Please login.' 
        });
    });
});

// Handle user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required' 
        });
    }
    
    // Verify user credentials
    verifyUser(username, password, (err, user) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        // Login successful - create session
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: 'Login successful!',
            redirectTo: '/welcome'
        });
    });
});

// Get current user info (for welcome page)
app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not logged in' 
        });
    }
    
    res.json({ 
        success: true, 
        user: {
            id: req.session.userId,
            username: req.session.username
        }
    });
});

// Handle logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});