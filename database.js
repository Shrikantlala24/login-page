const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create or connect to database file
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create users table if it doesn't exist
        createUsersTable();
    }
});

// Function to create users table
function createUsersTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });
}

// Function to create new user
function createUser(username, email, password, callback) {
    // Hash password before storing (never store plain text passwords!)
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return callback(err, null);
        }
        
        const insertSQL = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(insertSQL, [username, email, hashedPassword], function(err) {
            if (err) {
                return callback(err, null);
            }
            // 'this.lastID' gives us the ID of newly created user
            callback(null, { id: this.lastID, username, email });
        });
    });
}

// Function to find user by username
function findUserByUsername(username, callback) {
    const selectSQL = `SELECT * FROM users WHERE username = ?`;
    db.get(selectSQL, [username], (err, row) => {
        callback(err, row);
    });
}

// Function to verify user password
function verifyUser(username, password, callback) {
    findUserByUsername(username, (err, user) => {
        if (err || !user) {
            return callback(err || new Error('User not found'), null);
        }
        
        // Compare provided password with stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return callback(err, null);
            }
            if (isMatch) {
                // Don't send password back to client
                const { password, ...userWithoutPassword } = user;
                callback(null, userWithoutPassword);
            } else {
                callback(new Error('Invalid password'), null);
            }
        });
    });
}

// Export functions so other files can use them
module.exports = {
    db,
    createUser,
    findUserByUsername,
    verifyUser
};