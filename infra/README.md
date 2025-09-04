# Infrastructure Documentation 🏗️

> **AWS CDK infrastructure as code for ContactFolio deployment**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The ContactFolio infrastructure is built using AWS CDK (Cloud Development Kit) with Python. It provides a production-ready deployment with managed services for optimal performance and reliability.

### Key Features
- **Infrastructure as Code** with AWS CDK
- **Containerized backend** with ECS Fargate (autoscaling)
- **Managed database** with RDS Aurora Serverless v2 (autoscaling and read replica)
- **Redis caching** with ElastiCache
- **Global CDN** with CloudFront
- **Load balancing** with Application Load Balancer
- **SSL/TLS termination** and security

## 🏗️ Architecture

The infrastructure is built on AWS using CDK (Cloud Development Kit) with the following key components:

**Frontend Stack:**
- **CloudFront CDN** - Global content delivery with compression and caching
- **S3 Bucket** - Static frontend hosting with encryption
- **Route 53** - DNS management and domain routing
- **Certificate Manager** - SSL/TLS certificates with auto-renewal

**Backend Stack:**
- **Application Load Balancer (ALB)** - SSL termination and health checks
- **Fargate** - Containerized backend with load balancing and autoscaling
- **RDS Aurora Serverless v2** - PostgreSQL database with autoscaling, write-read replica, encryption and 7-day backups
- **ElastiCache Redis** - Session storage with TLS encryption
- **VPC** - Private/public subnets with NAT Gateway for outbound internet access

For detailed architecture diagrams and infrastructure code, see the [`architecture_diagrams/`](./architecture_diagrams/) folder.

## 🔧 Prerequisites

### Required Tools
- **Python 3.8+** for CDK
- **Node.js 18+** for backend
- **AWS CLI** configured with credentials
- **Docker** for container builds

### AWS Requirements
- **AWS Account** with appropriate permissions
- **IAM User/Role** with CDK deployment permissions
- **Domain name** (optional, for custom domain)

### Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "ecs:*",
        "rds:*",
        "elasticache:*",
        "s3:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "iam:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 Setup

### 1. Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install AWS CDK globally
npm install -g aws-cdk

# Bootstrap CDK (first time only)
cdk bootstrap
```

### 2. Environment Configuration
Set environment variables for your deployment:

```bash
# Required
export CDK_DEFAULT_ACCOUNT="your-aws-account-id"
export CDK_DEFAULT_REGION="us-east-1"

# Optional (for custom domain)
export ROOT_DOMAIN="yourdomain.com"
export FRONTEND_SUBDOMAIN="www"
export APP_NAME="Contacts"
```

### 3. Infrastructure Structure
The CDK app creates two main stacks:

```python
# app.py
app = cdk.App()

# Backend infrastructure stack
backend_stack = BackendStack(
    app, 
    f"{app_name}BackendStack",
    app_name=app_name,
    root_domain=root_domain,
    env=env
)

# Frontend infrastructure stack
frontend_stack = FrontendStack(
    app, 
    f"{app_name}FrontendStack",
    app_name=app_name,
    root_domain=root_domain,
    frontend_subdomain=frontend_subdomain,
    env=env
)

# Frontend depends on backend
frontend_stack.add_dependency(backend_stack)
```

## 🚀 Deployment

### 1. Synthesize CloudFormation
```bash
# Generate CloudFormation templates
cdk synth

# Review generated templates
cdk diff
```

### 2. Deploy Infrastructure
```bash
# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy ContactsBackendStack

# Deploy with approval
cdk deploy --require-approval never
```

### 3. Deploy Application
```bash
# Deploy backend
cd ../backend && npm run deploy

# Deploy frontend
cd ../frontend && npm run build && npm run deploy
```

### 4. Verify Deployment
```bash
# Check stack status
cdk list

# View stack outputs
cdk list-outputs ContactsBackendStack

# Check resources in AWS Console
aws cloudformation describe-stacks --stack-name ContactsBackendStack
```

## ⚙️ Configuration

### Key Infrastructure Settings
The infrastructure uses these default configurations:

```python
# backend_stack.py - Key Infrastructure Configuration

# Database (Aurora Serverless v2)
serverless_v2_min_capacity=0.5,      # 0.5 ACU minimum
serverless_v2_max_capacity=2,         # 2 ACU maximum

# Fargate Service
cpu=256,                              # 256 CPU units (0.25 vCPU)
memory_limit_mib=512,                 # 512 MB memory
desired_count=1,                      # Fixed capacity (no auto-scaling)

# Redis Cache
cache_node_type="cache.t3.micro",     # t3.micro instance
num_cache_clusters=1,                 # Single node (no replication)
```

### Environment Variables
The backend service uses these environment variables:

```bash
# Backend Environment Variables
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
MAX_USERS=50
MAX_CONTACTS_PER_USER=50
PGDATABASE=postgres

# Secrets (managed by AWS Secrets Manager)
PGHOST, PGPORT, PGUSER, PGPASSWORD
SESSION_SECRET
REDIS_URL
```

### Custom Domain Setup
If you provide a `ROOT_DOMAIN` environment variable:

1. **Backend** gets `api.yourdomain.com`
2. **Frontend** gets `www.yourdomain.com`
3. **SSL certificates** are automatically created and validated
4. **Route 53** records are automatically configured

## 📊 Monitoring

### CloudWatch Metrics
Key metrics to monitor:

- **Application Load Balancer**
  - Request count
  - Target response time
  - Healthy/unhealthy host count

- **Fargate Service**
  - CPU utilization
  - Memory utilization
  - Running task count

- **RDS Database**
  - CPU utilization
  - Database connections
  - Free storage space

- **ElastiCache Redis**
  - Cache hits/misses
  - Memory usage
  - Connection count

### Logging
ECS tasks automatically log to CloudWatch Logs:

```bash
# View backend logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/Contacts"

# View specific log stream
aws logs get-log-events --log-group-name "/ecs/Contacts" --log-stream-name "stream-name"
```

## 🔒 Security

### Network Security
- **VPC** with private subnets for database and Redis
- **Security groups** with minimal required access
- **NAT Gateway** for outbound internet access from private subnets

### IAM Policies
- **Least privilege principle** for all service roles
- **Secrets Manager** for sensitive configuration
- **Task execution role** for ECS container permissions

### Encryption
- **RDS** - Encryption at rest enabled
- **ElastiCache** - Encryption in transit and at rest
- **S3** - Server-side encryption enabled
- **CloudFront** - HTTPS-only with TLS 1.2+

## 🐛 Troubleshooting

### Common Issues

#### CDK Deployment Failures
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name ContactsBackendStack

# Rollback failed deployment
aws cloudformation rollback-stack --stack-name ContactsBackendStack

# Delete failed stack
aws cloudformation delete-stack --stack-name ContactsBackendStack
```

#### Resource Creation Issues
```bash
# Check specific resource status
aws ecs describe-services --cluster ContactsEcsCluster --services ContactsFargateService

# Check logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/Contacts"

# Check database status
aws rds describe-db-clusters --db-cluster-identifier Contacts
```

#### Performance Issues
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=ContactsFargateService \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-01T23:59:59Z \
    --period 300 \
    --statistics Average
```

### Debug Commands
```bash
# CDK debugging
cdk synth --verbose
cdk diff --context debug=true

# CloudFormation debugging
aws cloudformation describe-stack-resources --stack-name ContactsBackendStack

# Resource tagging
aws resourcegroupstaggingapi get-resources --tag-filters Key=aws:cloudformation:stack-name,Values=ContactsBackendStack
```

## 📚 Additional Resources

- **[CDK Documentation](https://docs.aws.amazon.com/cdk/)** - Official AWS CDK docs
- **[CDK Examples](https://github.com/aws-samples/aws-cdk-examples)** - Sample implementations
- **[AWS Architecture Center](https://aws.amazon.com/architecture/)** - Best practices
- **[CloudFormation Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/)** - Resource definitions

## 🔄 Maintenance

### Regular Tasks
- **Security updates** - Update CDK and dependencies
- **Backup verification** - Test database restore procedures
- **Cost optimization** - Review and adjust resource sizes
- **Performance monitoring** - Analyze metrics and optimize

### Update Procedures
```bash
# Update CDK
npm update -g aws-cdk

# Update dependencies
pip install -r requirements.txt --upgrade

# Deploy updates
cdk deploy --all
```

---

**For more information, see the [main project README](../README.md)**
