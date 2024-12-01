#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Deploy smart contracts
echo "Deploying smart contracts..."
npx hardhat run scripts/deploy.js --network mainnet

# Run database migrations
echo "Running database migrations..."
psql -U $DB_USER -d $DB_NAME -f backend/src/db/migrations/001_initial_schema.sql

# Start the application
echo "Starting the application..."
docker-compose up -d

echo "Deployment complete!"