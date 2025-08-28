#!/bin/bash
set -e

echo "Building frontend..."

# Set the API URL for production
export NEXT_PUBLIC_API_URL="http://YOUR_ALB_DNS_NAME"

# Build the application
npm run build

echo "Frontend build completed!"