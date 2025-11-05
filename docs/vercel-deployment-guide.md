# Vercel Deployment Guide

## Quick Deployment Steps

### Step 1: Push to GitHub

Make sure your code is pushed to GitHub:

```bash
# If you haven't already, initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Add remote (if not already added)
git remote add origin <your-github-repo-url>

# Push to main branch
git push -u origin main
```

### Step 2: Connect GitHub to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account (or create account)
3. **Click "Add New Project"**
4. **Import Git Repository**:
   - Select your GitHub account
   - Find and select your `socratica` repository
   - Click "Import"

### Step 3: Configure Project Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `socratica` (important - your Next.js app is in this folder)
- **Build Command**: `npm run build` (should auto-detect)
- **Output Directory**: `.next` (should auto-detect)
- **Install Command**: `npm install` (should auto-detect)

### Step 4: Configure Environment Variables

**CRITICAL**: Before deploying, add all environment variables in Vercel:

1. In the project import screen, click "Environment Variables"
2. Add each variable:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
OPENAI_API_KEY=<your-openai-api-key>  (MARK AS "Server-side only")
```

**Optional variables:**
```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-messaging-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
```

**Important**: 
- Mark `OPENAI_API_KEY` as "Server-side only" (it's a secret)
- All `NEXT_PUBLIC_*` variables are exposed to the browser, so no secrets there

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-5 minutes first time)
3. You'll get a URL like: `https://socratica-xyz.vercel.app`

### Step 6: Update Firebase Authorized Domains

**CRITICAL**: After deployment, update Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain: `your-app.vercel.app`
6. If you add a custom domain later, add that too

### Step 7: Test Deployment

Visit your Vercel URL and verify:
- ✅ App loads correctly
- ✅ Firebase authentication works
- ✅ Chat interface works
- ✅ OCR/image upload works (if implemented)

---

## Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy production when you push to `main` branch
- ✅ Create preview deployments for every PR
- ✅ Show build logs and deployment status

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `socratica.app`)
3. Follow DNS instructions (add CNAME record)
4. SSL certificate is automatic
5. Update Firebase authorized domains with your custom domain

---

## Troubleshooting

### Build Fails

**Check:**
- Root directory is set to `socratica`
- Environment variables are all set
- Build command works locally (`cd socratica && npm run build`)

### Firebase Auth Not Working

**Check:**
- Vercel domain is added to Firebase authorized domains
- Environment variables are correct
- Firebase project is configured correctly

### API Routes Not Working

**Check:**
- `OPENAI_API_KEY` is set and marked as "Server-side only"
- API routes are in `socratica/app/api/` directory

---

## What Happens Next

After first deployment:
- Every push to `main` → Automatic production deployment
- Every PR → Preview deployment URL
- Build logs available in Vercel dashboard
- Rollback available with one click

---

## Quick Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] All environment variables ready
- [ ] Firebase project configured
- [ ] Local build works (`cd socratica && npm run build`)

After deploying:
- [ ] Verify app loads at Vercel URL
- [ ] Add Vercel domain to Firebase authorized domains
- [ ] Test authentication
- [ ] Test main features

---

That's it! Push to GitHub → Connect to Vercel → Configure env vars → Deploy → Update Firebase domains




