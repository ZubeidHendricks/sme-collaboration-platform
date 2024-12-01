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

-- Create documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_documents_hash ON documents(hash);