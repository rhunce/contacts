#!/bin/bash
set -e

echo "Deploying backend infrastructure..."

# Validate environment variables
if [ -z "$CDK_DEFAULT_ACCOUNT" ] || [ -z "$CDK_DEFAULT_REGION" ] || [ -z "$APP_NAME" ]; then
  echo "Error: Required environment variables not set"
  echo "Please set: CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION, APP_NAME"
  exit 1
fi

# Deploy backend stack
npx cdk deploy ${APP_NAME}BackendStack --require-approval never

echo "Backend deployment completed!"
echo "Getting ALB URL..."

# Get the ALB URL
ALB_URL=$(aws cloudformation describe-stacks \
  --stack-name ${APP_NAME}BackendStack \
  --query 'Stacks[0].Outputs[?OutputKey==`AlbUrl`].OutputValue' \
  --output text)

echo "Backend API URL: $ALB_URL"
echo "Use this URL as NEXT_PUBLIC_API_URL for frontend deployment"
