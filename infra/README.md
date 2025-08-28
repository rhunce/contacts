# Contacts Infrastructure

AWS CDK infrastructure for the Contacts application with separate backend and frontend stacks.

## Architecture

- **Backend Stack**: VPC, Aurora PostgreSQL, Redis ElastiCache, ECS Fargate with ALB
- **Frontend Stack**: S3 bucket, CloudFront distribution for static hosting

## Prerequisites

- Node.js 18+
- AWS CLI configured
- CDK bootstrapped in your AWS account

## Environment Variables

Set these environment variables:

```bash
export CDK_DEFAULT_ACCOUNT="your-aws-account-id"
export CDK_DEFAULT_REGION="us-east-1"
export APP_NAME="contacts"
```

## Deployment Options

### Option 1: Deploy Everything (GitHub Actions)

Push to main branch to trigger automatic deployment via GitHub Actions.

### Option 2: Deploy Backend Only

```bash
cd infra
./scripts/deploy-backend.sh
```

This will:
1. Deploy VPC, RDS, Redis, ECS infrastructure
2. Output the ALB URL for frontend configuration

### Option 3: Deploy Frontend Only

```bash
cd infra
export NEXT_PUBLIC_API_URL="http://your-alb-url"
./scripts/deploy-frontend.sh
```

This will:
1. Deploy S3 bucket and CloudFront distribution
2. Build and deploy the frontend application
3. Invalidate CloudFront cache

### Option 4: Deploy Both Stacks

```bash
cd infra

# Deploy backend first
./scripts/deploy-backend.sh

# Get the ALB URL and deploy frontend
export NEXT_PUBLIC_API_URL="$(aws cloudformation describe-stacks --stack-name ${APP_NAME}BackendStack --query 'Stacks[0].Outputs[?OutputKey==`AlbUrl`].OutputValue' --output text)"
./scripts/deploy-frontend.sh
```

## Stack Outputs

### Backend Stack Outputs

- `AlbUrl`: Load Balancer URL for the API
- `DatabaseEndpoint`: Aurora PostgreSQL endpoint
- `RedisEndpoint`: Redis ElastiCache endpoint
- `VpcId`: VPC ID

### Frontend Stack Outputs

- `FrontendUrl`: CloudFront URL for the frontend
- `FrontendBucketName`: S3 bucket name
- `CloudFrontDistributionId`: CloudFront distribution ID

## Manual Deployment Commands

### Deploy Backend Stack

```bash
npx cdk deploy ${APP_NAME}BackendStack --require-approval never
```

### Deploy Frontend Stack

```bash
npx cdk deploy ${APP_NAME}FrontendStack --require-approval never
```

### Destroy Stacks

```bash
# Destroy frontend first (depends on backend)
npx cdk destroy ${APP_NAME}FrontendStack

# Then destroy backend
npx cdk destroy ${APP_NAME}BackendStack
```

## Frontend Deployment

After deploying the frontend infrastructure:

1. **Build the frontend**:
   ```bash
   cd ../frontend
   export NEXT_PUBLIC_API_URL="http://your-alb-url"
   npm run build
   ```

2. **Deploy to S3**:
   ```bash
   aws s3 sync out/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation --distribution-id your-distribution-id --paths "/*"
   ```

## Cost Optimization

- **Backend**: Aurora Serverless v2 scales to 0 when not in use
- **Frontend**: S3 + CloudFront is very cost-effective for static hosting
- **Redis**: t3.micro instance for session storage

## Security

- All resources are in private subnets where possible
- Secrets stored in AWS Secrets Manager
- HTTPS enforced on CloudFront
- CORS configured for frontend domain only

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Required**:
   ```bash
   npx cdk bootstrap aws://${CDK_DEFAULT_ACCOUNT}/${CDK_DEFAULT_REGION}
   ```

2. **Environment Variables Not Set**:
   Ensure all required environment variables are set before deployment.

3. **Frontend Build Fails**:
   Check that `NEXT_PUBLIC_API_URL` is set correctly.

4. **CORS Issues**:
   The deployment automatically updates the API's CORS configuration with the frontend URL.

### Useful Commands

```bash
# List all stacks
npx cdk list

# View stack outputs
aws cloudformation describe-stacks --stack-name ${APP_NAME}BackendStack --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name ${APP_NAME}FrontendStack --query 'Stacks[0].Outputs'

# Check ECS service status
aws ecs describe-services --cluster ${APP_NAME}EcsCluster --services ${APP_NAME}FargateService
```
