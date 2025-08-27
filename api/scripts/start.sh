#!/bin/sh

# Exit on any error
set -e

echo "Starting application..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node dist/index.js
