#!/bin/bash
set -e

echo "Deploying frontend infrastructure and application..."

# Validate environment variables
if [ -z "$CDK_DEFAULT_ACCOUNT" ] || [ -z "$CDK_DEFAULT_REGION" ] || [ -z "$APP_NAME" ]; then
  echo "Error: Required environment variables not set"
  echo "Please set: CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION, APP_NAME"
  exit 1
fi

# Check if ALB URL is provided
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "Error: NEXT_PUBLIC_API_URL not set"
  echo "Please set this to your backend ALB URL"
  exit 1
fi

# Deploy frontend infrastructure
echo "Deploying frontend infrastructure..."
npx cdk deploy ${APP_NAME}FrontendStack --require-approval never

# Get bucket name
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name ${APP_NAME}FrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# Get CloudFront distribution ID
CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
  --stack-name ${APP_NAME}FrontendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# Build frontend
echo "Building frontend application..."
cd ../frontend
npm ci
npm run build

# Deploy to S3
echo "Deploying to S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo "Frontend deployment completed!"
echo "Frontend URL: https://$(aws cloudformation describe-stacks --stack-name ${APP_NAME}FrontendStack --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' --output text)"
