const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default postgres database first
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query(`
      CREATE DATABASE sme_platform
      WITH 
      ENCODING = 'UTF8'
      LC_COLLATE = 'English_South Africa.1252'
      LC_CTYPE = 'English_South Africa.1252'
      TEMPLATE template0;
    `);
    
    console.log('Database created successfully');

    // Connect to the newly created database
    const projectPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'sme_platform',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Run migrations
    await projectPool.query(`
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) UNIQUE NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create projects table
      CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          budget NUMERIC(15,2) NOT NULL,
          deadline TIMESTAMP NOT NULL,
          team_size INTEGER NOT NULL,
          owner_id INTEGER REFERENCES users(id),
          status VARCHAR(20) DEFAULT 'OPEN',
          ipfs_hash VARCHAR(64),
          blockchain_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database schema created successfully');
    await projectPool.end();

  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists');
    } else {
      console.error('Error initializing database:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

initializeDatabase()
  .then(() => console.log('Database initialization completed'))
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });