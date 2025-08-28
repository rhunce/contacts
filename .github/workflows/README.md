# Deployment Workflows

This repository uses separate deployment workflows for optimized CI/CD performance.

## Workflow Overview

### 1. **Deploy Backend** (`.github/workflows/deploy-backend.yml`)
- **Triggers**: Changes to backend files or manual trigger
- **Purpose**: Deploy only the backend infrastructure and API
- **Duration**: ~15-20 minutes
- **When to use**: Backend code changes, infrastructure updates

### 2. **Deploy Frontend** (`.github/workflows/deploy-frontend.yml`)
- **Triggers**: Changes to frontend files or manual trigger
- **Purpose**: Deploy only the frontend application
- **Duration**: ~5-8 minutes
- **When to use**: Frontend code changes, UI updates

### 3. **Deploy Full Stack** (`.github/workflows/deploy.yml`)
- **Triggers**: Changes to both backend and frontend, or manual trigger
- **Purpose**: Deploy both backend and frontend together
- **Duration**: ~20-25 minutes
- **When to use**: Major releases, infrastructure changes affecting both

## Trigger Conditions

### Backend Deployment Triggers
```yaml
paths:
  - 'backend/**'                    # Backend code changes
  - 'infra/lib/backend-stack.ts'    # Backend infrastructure changes
  - 'infra/bin/contacts.ts'         # CDK app changes
  - '.github/workflows/deploy-backend.yml'  # Workflow changes
```

### Frontend Deployment Triggers
```yaml
paths:
  - 'frontend/**'                   # Frontend code changes
  - 'infra/lib/frontend-stack.ts'   # Frontend infrastructure changes
  - 'infra/bin/contacts.ts'         # CDK app changes
  - '.github/workflows/deploy-frontend.yml'  # Workflow changes
```

### Full Stack Deployment Triggers
```yaml
paths:
  - 'backend/**'                    # Backend changes
  - 'frontend/**'                   # Frontend changes
  - 'infra/**'                      # Infrastructure changes
  - '.github/workflows/deploy.yml'  # Workflow changes
```

## Manual Deployment

All workflows support manual triggers via GitHub Actions UI:

1. Go to **Actions** tab in your repository
2. Select the desired workflow
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Deployment Process

### Backend Deployment
1. Deploy CDK Backend Stack (ECS, RDS, Redis, ALB)
2. Output ALB URL for frontend configuration

### Frontend Deployment
1. Get existing backend ALB URL
2. Deploy CDK Frontend Stack (S3, CloudFront)
3. Build frontend with backend URL
4. Upload to S3 and invalidate CloudFront cache
5. Update backend CORS configuration

### Full Stack Deployment
1. Deploy backend infrastructure
2. Deploy frontend infrastructure
3. Build and deploy frontend application
4. Update CORS configuration

## Benefits

✅ **Faster Deployments**: Only deploy what changed  
✅ **Reduced Costs**: Shorter GitHub Actions runtime  
✅ **Better CI/CD**: Independent deployment cycles  
✅ **Easier Debugging**: Isolated deployment issues  
✅ **Manual Control**: Choose what to deploy when  

## Best Practices

1. **Frontend Changes**: Use `deploy-frontend.yml` (5-8 min)
2. **Backend Changes**: Use `deploy-backend.yml` (15-20 min)
3. **Major Releases**: Use `deploy.yml` (20-25 min)
4. **Infrastructure**: Use appropriate workflow based on what changed

## Troubleshooting

### Workflow Not Triggering
- Check if file changes match the `paths` filter
- Verify branch name matches trigger conditions
- Use manual trigger if needed

### Deployment Failures
- Check GitHub Actions logs for specific errors
- Verify AWS credentials and permissions
- Ensure required environment variables are set
