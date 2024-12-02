const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'sme_platform.db');
console.log('Creating database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created successfully');
        }
    });

    // Create projects table
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            budget REAL NOT NULL,
            deadline DATETIME NOT NULL,
            team_size INTEGER NOT NULL,
            owner_id INTEGER,
            status TEXT DEFAULT 'OPEN',
            ipfs_hash TEXT,
            blockchain_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating projects table:', err);
        } else {
            console.log('Projects table created successfully');
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
        return;
    }
    console.log('Database connection closed');
});