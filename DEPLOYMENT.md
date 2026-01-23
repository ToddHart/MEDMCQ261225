# Deployment Guide - MedMCQ

## Current Deployment Setup

The application is currently deployed on **Emergent.sh** using:
- Environment: `fastapi_react_mongo_shadcn_base_image_cloud_arm:release-17122025-2`
- Job ID: `da7e9f14-4c63-41d0-b31a-689987cd63ad`

## Auto-Deployment from GitHub

### Option 1: Emergent.sh GitHub Integration (Recommended)

Emergent.sh supports automatic deployments from GitHub repositories. Here's how to set it up:

#### Prerequisites
1. Your code is in a GitHub repository (✅ Already done: ToddHart/MEDMCQ261225)
2. You have an Emergent.sh account
3. You have admin access to the GitHub repository

#### Setup Steps

1. **Connect GitHub to Emergent**
   - Log in to Emergent.sh dashboard
   - Navigate to Settings → Integrations
   - Connect your GitHub account
   - Authorize Emergent to access your repositories

2. **Configure Auto-Deploy**
   - In Emergent dashboard, select your project
   - Go to Deployment Settings
   - Enable "Auto-deploy from GitHub"
   - Select branch: `main` or `claude/open-file-8kV0q` (your working branch)
   - Choose deployment trigger:
     - "On push to branch" (recommended)
     - "On pull request merge"
     - "Manual only"

3. **Set Up Webhooks** (if not automatic)
   - Emergent should automatically create webhooks
   - If manual setup needed:
     - Go to GitHub repo → Settings → Webhooks
     - Add webhook URL provided by Emergent
     - Set content type to `application/json`
     - Choose "Just the push event"
     - Save

4. **Environment Variables**
   - In Emergent dashboard, add all required environment variables:
     ```
     NOREPLY_EMAIL=noreply@medmcq.com.au
     NOREPLY_PASSWORD=***
     SUPPORT_EMAIL=support@medmcq.com.au
     SUPPORT_PASSWORD=***
     SMTP_HOST=smtp.zoho.com
     SMTP_PORT=587
     IMAP_HOST=imap.zoho.com
     IMAP_PORT=993
     APP_URL=https://your-app.emergent.sh
     MONGODB_URI=***
     JWT_SECRET=***
     ```

5. **Test Deployment**
   - Make a small change and push to your branch
   - Watch Emergent dashboard for deployment progress
   - Verify application is running correctly

### Option 2: GitHub Actions (Alternative)

If Emergent.sh doesn't support native GitHub integration or you want more control:

#### Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Emergent

on:
  push:
    branches:
      - main
      - claude/open-file-8kV0q
  workflow_dispatch: # Allow manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Emergent
        env:
          EMERGENT_API_KEY: ${{ secrets.EMERGENT_API_KEY }}
        run: |
          # Install Emergent CLI if available
          # or use Emergent API to trigger deployment
          curl -X POST https://api.emergent.sh/deploy \
            -H "Authorization: Bearer $EMERGENT_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "project_id": "${{ secrets.EMERGENT_PROJECT_ID }}",
              "git_ref": "${{ github.sha }}",
              "branch": "${{ github.ref_name }}"
            }'

      - name: Wait for deployment
        run: |
          echo "Waiting for deployment to complete..."
          # Add deployment status check here

      - name: Notify on success
        if: success()
        run: echo "Deployment successful!"

      - name: Notify on failure
        if: failure()
        run: echo "Deployment failed!"
```

#### Required GitHub Secrets
Add these in your GitHub repo → Settings → Secrets and variables → Actions:
- `EMERGENT_API_KEY` - Your Emergent.sh API key
- `EMERGENT_PROJECT_ID` - Your project ID from Emergent

### Option 3: Manual Deployment Script

If automatic deployment isn't available, create a deployment script:

Create `deploy.sh`:

```bash
#!/bin/bash

# MedMCQ Deployment Script for Emergent.sh

echo "🚀 Deploying MedMCQ to Emergent.sh..."

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Ensure we have the latest code
echo "📥 Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Run any pre-deployment checks
echo "🧪 Running pre-deployment checks..."

# Check backend dependencies
if [ -f "backend/requirements.txt" ]; then
    echo "✓ Backend requirements found"
fi

# Check frontend dependencies
if [ -f "frontend/package.json" ]; then
    echo "✓ Frontend package.json found"
fi

# Deploy using Emergent CLI or API
echo "📤 Triggering Emergent deployment..."

# Option A: Using Emergent CLI (if available)
# emergent deploy --project-id=da7e9f14-4c63-41d0-b31a-689987cd63ad

# Option B: Using curl to Emergent API
# curl -X POST https://api.emergent.sh/v1/deployments \
#   -H "Authorization: Bearer $EMERGENT_API_KEY" \
#   -H "Content-Type: application/json" \
#   -d "{
#     \"project_id\": \"da7e9f14-4c63-41d0-b31a-689987cd63ad\",
#     \"branch\": \"$CURRENT_BRANCH\"
#   }"

echo "✅ Deployment triggered successfully!"
echo "🔍 Check Emergent.sh dashboard for deployment status"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Deployment Checklist

Before enabling auto-deployment, ensure:

- [ ] All environment variables are configured in Emergent
- [ ] Email credentials (NOREPLY_EMAIL, SUPPORT_EMAIL) are set
- [ ] Database connection string is correct
- [ ] APP_URL points to production URL
- [ ] JWT_SECRET is set to a secure value
- [ ] GitHub repository is connected to Emergent
- [ ] Deployment webhooks are configured
- [ ] Test deployment works correctly
- [ ] Rollback procedure is documented
- [ ] Monitoring/alerts are set up

## Post-Deployment Verification

After each deployment, verify:

1. **Application Health**
   ```bash
   curl https://your-app.emergent.sh/health
   ```

2. **Email Functionality**
   - Test forgot password email
   - Test email verification
   - Test contact form
   - Check support@ inbox

3. **Database Connection**
   - Verify app can read/write data
   - Check for any migration issues

4. **Authentication**
   - Test login/logout
   - Test admin access
   - Verify JWT tokens work

## Rollback Procedure

If a deployment fails:

1. **Via Emergent Dashboard**
   - Go to Deployments
   - Find last successful deployment
   - Click "Rollback to this version"

2. **Via Git**
   ```bash
   git revert <commit-hash>
   git push
   # Will trigger new deployment with reverted changes
   ```

3. **Emergency Rollback**
   - Contact Emergent support
   - Use manual deployment override

## Monitoring and Logs

### View Deployment Logs
- Emergent Dashboard → Deployments → View Logs
- Look for errors during build/deploy process

### View Application Logs
- Emergent Dashboard → Logs
- Filter by service (frontend/backend)
- Search for errors or warnings

### Set Up Alerts
Configure alerts in Emergent for:
- Deployment failures
- Application errors
- High resource usage
- Downtime

## Branching Strategy for Deployments

### Recommended Setup:

1. **Production Branch: `main`**
   - Auto-deploys to production
   - Only merge tested, approved code
   - Protected branch (require PR reviews)

2. **Development Branch: `develop`**
   - Auto-deploys to staging environment
   - Integration testing happens here
   - Merge feature branches here first

3. **Feature Branches: `claude/*`, `feature/*`**
   - No auto-deployment
   - Create PR to merge into `develop`
   - Delete after merge

### Current Branch: `claude/open-file-8kV0q`
- This is a feature branch
- Consider merging to `main` when ready
- Then set up auto-deploy from `main`

## Cost Considerations

- Emergent.sh pricing varies by usage
- Auto-deployments are typically included
- Check your plan for:
  - Number of deployments/month
  - Build minutes
  - Bandwidth/storage limits

## Support

For Emergent-specific deployment issues:
- Emergent.sh Documentation: https://docs.emergent.sh
- Emergent Support: support@emergent.sh
- Community Discord: (check Emergent.sh website)

For application-specific issues:
- Check backend logs in Emergent dashboard
- Review recent commits for breaking changes
- Test locally before deploying

## Next Steps

1. Enable auto-deployment from GitHub (Option 1 recommended)
2. Set up staging environment for testing
3. Configure deployment notifications (Slack, email)
4. Document any custom deployment steps
5. Create deployment runbook for team

---

**Note:** The specifics of Emergent.sh deployment depend on their platform capabilities. If Emergent doesn't support GitHub integration natively, contact their support to inquire about webhook or API-based deployment options.
