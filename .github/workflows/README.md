# Deployment Workflow

This repository uses a **single, comprehensive deployment workflow** for simplicity and reliability.

## Workflow Overview

### **Deploy Full Stack** (`.github/workflows/deploy.yml`)
- **Triggers**: Any changes to `backend/**`, `frontend/**`, or `infra/**` files
- **Purpose**: Complete deployment of everything in the correct order
- **Duration**: ~20-25 minutes
- **When to use**: Any code or infrastructure changes

## Simple and Reliable

✅ **One Workflow**: No complexity, no conflicts, no race conditions  
✅ **Correct Order**: Backend → Frontend → CORS configuration  
✅ **Handles Everything**: Code changes, infrastructure changes, mixed changes  
✅ **Predictable**: Always deploys everything in the right sequence  
✅ **No Gotchas**: Works the same way every time  

## Trigger Conditions

```yaml
paths:
  - 'backend/**'                    # Backend code changes
  - 'frontend/**'                   # Frontend code changes
  - 'infra/**'                      # Infrastructure changes
```

## Deployment Process

### 1. Deploy Backend
- Deploy CDK Backend Stack (ECS, RDS, Redis, ALB)
- Build and deploy backend code (Docker image)
- Output ALB URL

### 2. Deploy Frontend
- Deploy CDK Frontend Stack (S3, CloudFront)
- Build frontend with backend URL
- Upload to S3 and invalidate CloudFront cache

### 3. Update CORS Configuration
- Update backend ECS service with frontend URL
- Ensure proper communication between frontend and backend

## Deployment Scenarios

### Scenario 1: Backend Code Change
```bash
# Changes: backend/src/services/authService.ts
# Result: Full stack deployment runs
# Duration: 20-25 minutes
```

### Scenario 2: Frontend Code Change
```bash
# Changes: frontend/src/components/ContactCard.tsx
# Result: Full stack deployment runs
# Duration: 20-25 minutes
```

### Scenario 3: Infrastructure Change
```bash
# Changes: infra/package.json, infra/cdk.json
# Result: Full stack deployment runs
# Duration: 20-25 minutes
```

### Scenario 4: Mixed Changes
```bash
# Changes: backend/ + frontend/ + infra/
# Result: Full stack deployment runs
# Duration: 20-25 minutes
```

### Scenario 5: Manual Deployment
```bash
# Manual trigger via GitHub Actions UI
# Result: Full stack deployment runs
# Duration: 20-25 minutes
```

## Manual Deployment

The workflow supports manual triggers via GitHub Actions UI:

1. Go to **Actions** tab in your repository
2. Select **Deploy Full Stack**
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Benefits

✅ **Zero Conflicts**: Only one workflow, no race conditions  
✅ **Always Correct**: Deploys everything in the right order  
✅ **Simple**: Easy to understand and maintain  
✅ **Reliable**: Works the same way every time  
✅ **No Gotchas**: No complex trigger logic to debug  

## Best Practices

1. **Any Changes**: Push your changes and let the workflow handle everything
2. **Manual Deployments**: Use manual trigger for testing or emergency deployments
3. **Monitor**: Watch the deployment logs to ensure everything completes successfully

## Troubleshooting

### Workflow Not Triggering
- Check if file changes match the `paths` filter
- Verify branch name matches trigger conditions
- Use manual trigger if needed

### Deployment Failures
- Check GitHub Actions logs for specific errors
- Verify AWS credentials and permissions
- Ensure required environment variables are set

### Performance
- **All deployments**: Take 20-25 minutes
- **Consistent timing**: Same duration regardless of change type
- **Reliable**: No unexpected variations in deployment time
