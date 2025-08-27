#!/bin/sh

# Exit on any error
set -e

echo "Starting application..."

# Construct DATABASE_URL from individual environment variables
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node dist/index.js
