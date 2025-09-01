#!/bin/bash

# Deployment script with test validation
set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Step 1: Install ALL dependencies (including dev dependencies for testing)
echo "📦 Installing dependencies..."
npm ci

# Step 2: Run tests
echo "🧪 Running tests..."
npm test

# Step 3: Check test coverage
echo "📊 Checking test coverage..."
npm run test:coverage

# Step 4: Build application
echo "🔨 Building application..."
npm run build

# Step 5: Run any additional checks
echo "✅ Running additional checks..."
npm audit --audit-level=moderate || {
    echo "⚠️  Security audit found moderate or higher vulnerabilities"
    echo "Please fix these before deploying"
    exit 1
}

echo "🎉 All checks passed! Ready for deployment."
echo "📁 Build output available in: dist/"

# Optional: Add your actual deployment commands here
# echo "🚀 Deploying to production..."
# aws s3 sync dist/ s3://your-bucket/
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
