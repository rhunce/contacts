# Contacts Application Infrastructure

AWS CDK Python implementation for the full-stack contacts management application.

## 🏗️ Architecture

This infrastructure creates a complete AWS environment for the contacts application:

### Backend Stack (`BackendStack`)
- **VPC**: Multi-AZ VPC with public, private, and isolated subnets
- **Aurora PostgreSQL**: Managed database cluster for data persistence
- **ElastiCache Redis**: Session storage and caching
- **ECS Fargate**: Containerized backend API with auto-scaling
- **Application Load Balancer**: HTTPS termination and routing
- **Route53**: DNS management and custom domain support
- **ACM**: SSL certificate management
- **Secrets Manager**: Secure credential storage

### Frontend Stack (`FrontendStack`)
- **S3 Bucket**: Static website hosting
- **CloudFront**: Global CDN with edge caching
- **Route53**: DNS management for custom domains
- **ACM**: SSL certificate for HTTPS

## 🐍 Python Implementation

This project showcases Python skills through:

### Code Organization
- **Modular Design**: Separate stacks for backend and frontend
- **Type Hints**: Full type annotation for better code quality
- **Docstrings**: Comprehensive documentation
- **Clean Architecture**: Separation of concerns

### Python Features Used
- **Type Hints**: `Optional[str]`, `List[ec2.SubnetConfiguration]`
- **F-strings**: Modern string formatting
- **Context Managers**: Resource management
- **List Comprehensions**: Concise data transformations
- **Class Inheritance**: Extending CDK constructs

### AWS CDK Python Patterns
- **Construct Classes**: Custom infrastructure components
- **Environment Variables**: Dynamic configuration
- **Resource Dependencies**: Proper resource ordering
- **Output Management**: CloudFormation outputs

## 🚀 Deployment

### Prerequisites
- Python 3.11+
- AWS CLI configured
- CDK v2 installed globally

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy ContactsBackendStack
cdk deploy ContactsFrontendStack
```

### Environment Variables
Set these environment variables for deployment:

```bash
export CDK_DEFAULT_ACCOUNT="your-aws-account-id"
export CDK_DEFAULT_REGION="us-east-1"
export APP_NAME="Contacts"
export ROOT_DOMAIN="yourdomain.com"
export MAX_USERS="50"
export MAX_CONTACTS_PER_USER="50"
```

### GitHub Actions
The infrastructure is automatically deployed via GitHub Actions when changes are pushed to the main branch.

## 🔧 Configuration

### Dynamic Limits
The application supports configurable limits via environment variables:

- `MAX_USERS`: Maximum number of users (default: 50)
- `MAX_CONTACTS_PER_USER`: Maximum contacts per user (default: 50)

### Custom Domains
To use custom domains:

1. Set `ROOT_DOMAIN` environment variable
2. Ensure Route53 hosted zone exists
3. Deploy infrastructure
4. Update DNS records automatically

## 📊 Monitoring & Logging

### CloudWatch Integration
- Application logs via ECS
- Database metrics via RDS
- Cache metrics via ElastiCache
- Load balancer access logs

### Health Checks
- ECS service health checks
- Load balancer health checks
- Database connectivity monitoring

## 🔒 Security

### Network Security
- VPC with isolated subnets
- Security groups with minimal access
- NAT gateways for outbound traffic
- Private subnets for databases

### Data Security
- Encryption at rest (RDS, S3, ElastiCache)
- Encryption in transit (TLS/SSL)
- Secrets Manager for credentials
- IAM roles with least privilege

### Application Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Session management

## 🧪 Testing

### CDK Testing
```bash
# Synthesize CloudFormation templates
cdk synth

# Diff changes
cdk diff

# Validate templates
cdk doctor
```

### Infrastructure Testing
```bash
# Test VPC connectivity
aws ec2 describe-vpcs --vpc-ids $(aws cloudformation describe-stacks --stack-name ContactsBackendStack --query 'Stacks[0].Outputs[?OutputKey==`VpcId`].OutputValue' --output text)

# Test database connectivity
aws rds describe-db-clusters --db-cluster-identifier $(aws cloudformation describe-stacks --stack-name ContactsBackendStack --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)
```

## 📈 Scaling

### Auto Scaling
- ECS Fargate auto-scaling based on CPU/memory
- Aurora read replicas for database scaling
- CloudFront edge locations for global distribution

### Cost Optimization
- T3 instances for development
- Reserved instances for production
- S3 lifecycle policies
- CloudFront caching

## 🛠️ Maintenance

### Updates
```bash
# Update CDK dependencies
pip install --upgrade aws-cdk-lib

# Update infrastructure
cdk deploy --all
```

### Cleanup
```bash
# Destroy all resources
cdk destroy --all

# Destroy specific stack
cdk destroy ContactsBackendStack
```

## 📝 Best Practices

### Python Code Quality
- Type hints for all functions
- Comprehensive docstrings
- PEP 8 compliance
- Modular design

### Infrastructure as Code
- Immutable infrastructure
- Version control for all changes
- Automated deployments
- Environment parity

### Security First
- Least privilege access
- Encryption everywhere
- Regular security updates
- Audit logging

## 🎯 Python Skills Demonstrated

This project showcases:

1. **Advanced Python Features**
   - Type hints and annotations
   - Class inheritance and composition
   - Context managers and resource management
   - Modern Python syntax (f-strings, list comprehensions)

2. **AWS CDK Mastery**
   - Construct development
   - Resource orchestration
   - Environment management
   - Output handling

3. **Infrastructure Engineering**
   - Multi-tier architecture
   - Security best practices
   - Scalability patterns
   - Monitoring integration

4. **DevOps Practices**
   - CI/CD pipeline integration
   - Environment variable management
   - Automated testing
   - Documentation

This Python implementation demonstrates professional-grade infrastructure code with modern Python practices and AWS best practices.
