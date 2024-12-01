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
      CREATE DATABASE ${process.env.DB_NAME}
      WITH 
      ENCODING = 'UTF8'
      LC_COLLATE = 'en_US.utf8'
      LC_CTYPE = 'en_US.utf8';
    `);
    
    console.log('Database created successfully');

    // Connect to the newly created database
    const projectPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Run migrations
    await projectPool.query(`
      -- Create users table
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) UNIQUE NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create projects table
      CREATE TABLE projects (
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

      -- Create skills table
      CREATE TABLE skills (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          category VARCHAR(50)
      );

      -- Create project_skills table
      CREATE TABLE project_skills (
          project_id INTEGER REFERENCES projects(id),
          skill_id INTEGER REFERENCES skills(id),
          PRIMARY KEY (project_id, skill_id)
      );

      -- Create project_participants table
      CREATE TABLE project_participants (
          project_id INTEGER REFERENCES projects(id),
          sme_id INTEGER REFERENCES users(id),
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          PRIMARY KEY (project_id, sme_id)
      );

      -- Create indices
      CREATE INDEX idx_users_wallet ON users(wallet_address);
      CREATE INDEX idx_projects_status ON projects(status);
      CREATE INDEX idx_projects_owner ON projects(owner_id);
    `);

    console.log('Database schema created successfully');

    // Insert some initial data
    await projectPool.query(`
      -- Insert default skills
      INSERT INTO skills (name, category) VALUES
        ('Web Development', 'Technology'),
        ('Smart Contracts', 'Blockchain'),
        ('UI/UX Design', 'Design'),
        ('Project Management', 'Management'),
        ('Marketing', 'Business');
    `);

    console.log('Initial data inserted successfully');

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
