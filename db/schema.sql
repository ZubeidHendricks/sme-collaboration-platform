-- Users/SMEs table
CREATE TABLE smes (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    profile_image_hash VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    blockchain_id INTEGER UNIQUE,
    owner_id INTEGER REFERENCES smes(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget NUMERIC(15,2) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN'
);