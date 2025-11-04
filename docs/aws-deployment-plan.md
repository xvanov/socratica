# AWS Deployment Plan for Socratica

**Author:** xvanov  
**Date:** 2025-11-03  
**Version:** 1.0

---

## Executive Summary

This document outlines AWS deployment options for Socratica, comparing AWS Amplify (recommended) with Vercel, and providing step-by-step deployment guidance.

---

## AWS Deployment Options Analysis

### Option 1: AWS Amplify (Recommended for Next.js)

**Architecture:**
```
GitHub/GitLab → AWS Amplify → CloudFront CDN
                    ↓
            Next.js App (SSR + Static)
                    ↓
        Lambda Functions (API Routes)
```

**Pros:**
- ✅ Zero-config Next.js deployment
- ✅ Automatic Git-based deployments
- ✅ Preview deployments for PRs
- ✅ Built-in CI/CD pipeline
- ✅ SSR and static site generation support
- ✅ Edge functions for API routes
- ✅ CloudFront CDN included
- ✅ Free tier: 15 GB storage, 5 GB transfer/month
- ✅ Environment variable management
- ✅ Custom domain support

**Cons:**
- ⚠️ Less flexibility than pure serverless setup
- ⚠️ Some vendor lock-in (but can migrate)
- ⚠️ Pricing can scale unexpectedly at high traffic

**Cost Estimate (MVP):**
- Free tier covers initial usage
- Beyond free tier: ~$0.15/GB storage, $0.15/GB transfer
- Estimated: $5-20/month for MVP scale

**Best For:** MVP, rapid deployment, Next.js apps

---

### Option 2: AWS Lambda + CloudFront (Serverless)

**Architecture:**
```
GitHub Actions → S3 (build artifacts)
                    ↓
            CloudFront CDN
                    ↓
        Lambda@Edge (API Routes)
                    ↓
            Next.js Standalone
```

**Pros:**
- ✅ Full serverless architecture
- ✅ Pay-per-use pricing
- ✅ Highly scalable
- ✅ Full control over infrastructure
- ✅ Can use Infrastructure as Code (CDK/Terraform)

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires custom build pipeline
- ⚠️ More AWS knowledge required
- ⚠️ No automatic Git integration

**Cost Estimate:**
- Lambda: $0.20 per 1M requests
- CloudFront: $0.085/GB transfer
- S3: $0.023/GB storage
- Estimated: $10-50/month for MVP scale

**Best For:** Production scale, full control, cost optimization

---

### Option 3: AWS ECS/Fargate (Containerized)

**Architecture:**
```
Docker Container → ECS/Fargate
                      ↓
            Application Load Balancer
                      ↓
            CloudFront CDN
```

**Pros:**
- ✅ Full container control
- ✅ Can run any Node.js version
- ✅ Good for complex requirements
- ✅ Predictable performance

**Cons:**
- ⚠️ Most complex setup
- ⚠️ Requires Docker knowledge
- ⚠️ Minimum costs even with no traffic
- ⚠️ Overkill for MVP

**Cost Estimate:**
- Fargate: ~$0.04/vCPU-hour + $0.004/GB-hour
- ALB: ~$0.0225/hour ($16/month minimum)
- Estimated: $30-100/month minimum

**Best For:** Complex apps, existing container infrastructure

---

## Comparison: AWS Amplify vs Vercel

| Feature | AWS Amplify | Vercel |
|---------|-------------|--------|
| **Next.js Support** | ✅ Excellent | ✅ Optimal (created by Next.js team) |
| **Git Integration** | ✅ Automatic | ✅ Automatic |
| **Preview Deployments** | ✅ Yes | ✅ Yes |
| **Environment Variables** | ✅ Console/CLI | ✅ Dashboard |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSR Support** | ✅ Yes | ✅ Yes |
| **Edge Functions** | ✅ Lambda@Edge | ✅ Edge Runtime |
| **CDN** | ✅ CloudFront | ✅ Vercel Edge Network |
| **Free Tier** | ✅ 15GB storage, 5GB transfer | ✅ Generous |
| **Pricing Transparency** | ⚠️ Can be complex | ✅ Simple |
| **AWS Integration** | ✅ Native (S3, Lambda, etc.) | ❌ External |
| **Vendor Lock-in** | ⚠️ Moderate | ⚠️ Moderate |
| **Setup Complexity** | ⚠️ Medium | ✅ Very Easy |
| **Enterprise Features** | ✅ Comprehensive | ✅ Good |
| **Regional Deployment** | ✅ Multi-region | ✅ Global edge |

---

## Recommended Approach: AWS Amplify

**Rationale:**
1. **Best Next.js Integration**: AWS Amplify is the AWS-native solution for Next.js
2. **Rapid Deployment**: Similar ease to Vercel, but on AWS infrastructure
3. **AWS Ecosystem**: Easy integration with other AWS services if needed
4. **Cost-Effective**: Free tier sufficient for MVP, competitive pricing beyond
5. **Scalability**: Can scale to millions of users
6. **Migration Path**: Can migrate to Lambda + CloudFront later if needed

---

## Step-by-Step: AWS Amplify Deployment

### Prerequisites

1. AWS Account (create at https://aws.amazon.com)
2. GitHub/GitLab repository with code
3. Firebase project configured
4. OpenAI API key

### Step 1: Prepare Repository

Ensure your repository structure:
```
socratica/
├── socratica/          # Next.js app directory
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
├── amplify.yml          # Amplify build config (we'll create)
└── README.md
```

### Step 2: Create Amplify Build Configuration

Create `amplify.yml` at repository root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd socratica
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: socratica/.next
    files:
      - '**/*'
  cache:
    paths:
      - socratica/node_modules/**/*
      - socratica/.next/cache/**/*
```

### Step 3: Configure Next.js for Amplify

Update `socratica/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Enable standalone output for better Lambda performance
  output: 'standalone',
  // Configure for Amplify SSR
  trailingSlash: false,
};

export default nextConfig;
```

### Step 4: Deploy via AWS Amplify Console

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/amplify

2. **Create New App**
   - Click "New app" → "Host web app"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository and branch

3. **Configure Build Settings**
   - Amplify auto-detects Next.js
   - Verify build settings match `amplify.yml`
   - Set root directory to `socratica` if needed

4. **Configure Environment Variables**
   Add all required variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=<your-key>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-bucket>
   OPENAI_API_KEY=<your-key>
   ```

5. **Review and Deploy**
   - Review settings
   - Click "Save and deploy"
   - Wait for build to complete (~5-10 minutes first time)

### Step 5: Configure Custom Domain (Optional)

1. **In Amplify Console**
   - Go to App Settings → Domain management
   - Click "Add domain"
   - Enter your domain (e.g., `socratica.app`)

2. **Configure DNS**
   - Add CNAME record as instructed
   - SSL certificate auto-provisioned

### Step 6: Update Firebase Authorized Domains

1. **Firebase Console**
   - Go to Authentication → Settings → Authorized domains
   - Add your Amplify domain (e.g., `your-app.amplifyapp.com`)
   - Add custom domain if configured

---

## Alternative: AWS Lambda + CloudFront (Advanced)

If you need more control or are planning for scale:

### Architecture Components

1. **Build Pipeline**: GitHub Actions → Build → S3
2. **Static Assets**: S3 + CloudFront
3. **API Routes**: Lambda@Edge or Lambda Functions
4. **SSR**: Lambda Functions with Next.js standalone

### Implementation Steps

1. **Configure Next.js Standalone**
   ```typescript
   // next.config.ts
   output: 'standalone'
   ```

2. **Create Lambda Function**
   - Package Next.js standalone output
   - Create Lambda handler
   - Configure API Gateway

3. **Set Up CloudFront**
   - Origin: S3 (static) + API Gateway (dynamic)
   - Cache behaviors for static assets
   - Lambda@Edge for API routes

4. **CI/CD Pipeline**
   - GitHub Actions builds and deploys
   - Updates Lambda function code
   - Invalidates CloudFront cache

**Note:** This is significantly more complex. Only use if you need:
- Full infrastructure control
- Cost optimization at scale
- Integration with other AWS services

---

## Cost Comparison

### AWS Amplify (MVP Scale)
- **Free Tier**: 15 GB storage, 5 GB transfer/month
- **Beyond Free**: ~$0.15/GB storage, $0.15/GB transfer
- **Estimated**: $5-20/month for MVP

### Vercel (MVP Scale)
- **Free Tier**: Generous for personal projects
- **Pro**: $20/month for team
- **Estimated**: $0-20/month for MVP

### AWS Lambda + CloudFront (MVP Scale)
- **Lambda**: $0.20 per 1M requests
- **CloudFront**: $0.085/GB transfer
- **S3**: $0.023/GB storage
- **Estimated**: $10-50/month for MVP

**Conclusion**: All options are cost-effective for MVP. Choose based on:
- **Vercel**: Simplest, optimal Next.js support
- **AWS Amplify**: AWS ecosystem integration
- **Lambda + CloudFront**: Maximum control and optimization

---

## Migration Path: Vercel → AWS

If starting with Vercel and migrating to AWS later:

1. **Phase 1**: Deploy on Vercel (MVP)
2. **Phase 2**: When scaling, evaluate AWS Amplify
3. **Phase 3**: If needed, migrate to Lambda + CloudFront

**Migration Complexity**: Low (same Next.js app, different deployment)

---

## Security Considerations

### AWS Amplify
- ✅ HTTPS automatic (CloudFront)
- ✅ Environment variables encrypted
- ✅ IAM integration for access control
- ✅ AWS WAF available for DDoS protection

### Configuration Required
- Set up AWS WAF rules (optional)
- Configure CloudFront security headers
- Set up AWS Secrets Manager for sensitive data (optional)

---

## Monitoring & Analytics

### AWS Amplify
- **Built-in**: Amplify Console metrics
- **Integration**: CloudWatch for detailed logs
- **Analytics**: AWS Amplify Analytics (optional)

### Setup
1. Enable CloudWatch logs in Amplify Console
2. Set up CloudWatch alarms for errors
3. Configure AWS Amplify Analytics if needed

---

## CI/CD Comparison

### AWS Amplify
- ✅ Automatic from Git
- ✅ Preview deployments for PRs
- ✅ Build logs in console
- ✅ Rollback capability

### GitHub Actions (Alternative)
- ✅ Full control
- ✅ Custom workflows
- ✅ Integration with other tools

---

## Recommendation Summary

**For MVP: AWS Amplify**
- Easiest AWS deployment option
- Similar ease to Vercel
- AWS ecosystem integration
- Free tier sufficient
- Can scale to millions of users

**When to Choose Vercel Instead:**
- Maximum simplicity
- Optimal Next.js support (created by Next.js team)
- Team already familiar with Vercel

**When to Choose Lambda + CloudFront:**
- Need maximum control
- Cost optimization at scale
- Integration with complex AWS services
- Custom infrastructure requirements

---

## Next Steps

1. **Decision**: Choose AWS Amplify or Vercel for MVP
2. **Setup**: Follow deployment steps above
3. **Test**: Verify all features work
4. **Monitor**: Set up monitoring and alerts
5. **Optimize**: Monitor costs and performance

---

## References

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js on AWS Amplify](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/)
- [AWS Lambda + Next.js](https://github.com/serverless-nextjs/serverless-next.js)
- [Vercel Documentation](https://vercel.com/docs)

---

_This deployment plan provides architectural guidance for AWS deployment of Socratica. Choose based on your specific requirements, team expertise, and scaling needs._



