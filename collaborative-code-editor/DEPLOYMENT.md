# GitHub Pages Deployment Guide

This VS Code Clone is configured for automatic deployment to GitHub Pages.

## 🚀 Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/Devanshshar01/frontend-project
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Click **Save**

### Step 2: Push the Changes

The deployment workflow is already configured. Just push your code:

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### Step 3: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Once done, your site will be live!

## 🌐 Your Live URL

After deployment, your VS Code Clone will be available at:

**https://devanshshar01.github.io/frontend-project/**

## 🔄 Automatic Deployments

Every time you push to the `main` branch, GitHub Actions will:
1. ✅ Build your React app
2. ✅ Automatically deploy to GitHub Pages
3. ✅ Your changes go live in 2-3 minutes

## 🐛 Troubleshooting

### If the workflow fails:

1. Check the **Actions** tab for error messages
2. Make sure GitHub Pages is enabled in Settings → Pages
3. Ensure the workflow has the right permissions

### If you see a 404 page:

1. Wait a few more minutes (first deployment can take up to 10 minutes)
2. Clear your browser cache
3. Check that the base URL is correct in `vite.config.ts`

### To manually trigger deployment:

1. Go to **Actions** tab
2. Click "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

## 📝 Files Added for Deployment

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `vite.config.ts` - Updated with correct base path
- `DEPLOYMENT.md` - This guide

## 🎉 That's It!

Your VS Code Clone is now set up for automatic deployment. Every push to `main` will update your live site!

---

# Original Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Environment variables configured
- Backend API server running (for full functionality)

## Environment Configuration

### Development
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_ENV=development
```

### Production
```bash
VITE_API_BASE_URL=https://api.codecollab.io/api
VITE_WS_URL=wss://api.codecollab.io
VITE_ENV=production
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Access at: http://localhost:5173

## Production Build

```bash
# Run all checks
npm run type-check
npm run lint
npm run test

# Create production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/codecollab)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Configure environment variables in Vercel dashboard

### GitHub Integration

1. Connect repository to Vercel
2. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variables
4. Deploy automatically on push to main branch

## Deployment to Netlify

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
# Build Docker image
docker build -t codecollab:latest .

# Run container
docker run -p 8080:80 codecollab:latest
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization

### Pre-deployment Checklist

- [ ] Bundle size analyzed (< 500KB)
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Service worker registered

### Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

## Monitoring

### Error Tracking (Sentry)

```typescript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
});
```

### Analytics (Google Analytics)

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Rollback Strategy

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Health Checks

### Endpoint Monitoring

Create health check endpoint:
```typescript
// src/pages/health.tsx
export function Health() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Uptime Monitoring

Configure with:
- UptimeRobot
- Pingdom
- StatusCake

## Troubleshooting

### Build Fails

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear build cache:
```bash
rm -rf dist .vite
```

### Environment Variables Not Loading

1. Verify .env file exists
2. Ensure variables start with `VITE_`
3. Restart dev server after changes

### WebSocket Connection Issues

1. Check CORS configuration
2. Verify SSL certificates (wss://)
3. Check firewall rules
4. Test with polling fallback

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys not in source code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Dependencies scanned for vulnerabilities
- [ ] Rate limiting implemented

## Post-Deployment

1. Verify all features working
2. Check error logs
3. Monitor performance metrics
4. Test authentication flows
5. Validate real-time features
6. Run smoke tests

---

**Last Updated:** January 2025
**Version:** 1.0
