# Custom Domain Setup for GitHub Pages

## Current Issue

You tried to use `dev.openpecha.org` but got a DNS error because the custom domain isn't properly configured.

## Option 1: Use Default GitHub Pages Domain (Recommended for now)

Your app will be available at:

```
https://openpecha.github.io/openpecha_evalai_frontend
```

This is the easiest option and will work immediately once GitHub Pages is enabled.

## Option 2: Set Up Custom Domain (dev.openpecha.org)

If you own the `openpecha.org` domain and want to use `dev.openpecha.org`, follow these steps:

### 1. Configure GitHub Pages Custom Domain

1. Go to your repository: `https://github.com/OpenPecha/openpecha_evalai_frontend`
2. Go to **Settings** → **Pages**
3. In the "Custom domain" field, enter: `dev.openpecha.org`
4. Check "Enforce HTTPS"

### 2. Configure DNS Records

You need to configure DNS records with your domain provider (whoever manages openpecha.org):

**Option A: CNAME Record (Recommended for subdomains)**

```
Type: CNAME
Name: dev
Value: openpecha.github.io
TTL: 3600 (or default)
```

**Option B: A Records (if CNAME doesn't work)**

```
Type: A
Name: dev
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600 (or default)
```

### 3. Add CNAME file to repository

Create a file called `CNAME` in the `public` folder:

```
dev.openpecha.org
```

### 4. Update configuration files

**Update package.json:**

```json
"homepage": "https://dev.openpecha.org"
```

**Update vite.config.ts:**

```typescript
base: process.env.NODE_ENV === 'production' ? '/' : '/',
```

**Update Auth0 configuration:**

- Callback URLs: `https://dev.openpecha.org`
- Logout URLs: `https://dev.openpecha.org`
- Web Origins: `https://dev.openpecha.org`

### 5. Update GitHub Secrets

Update your GitHub repository secrets:

```
VITE_AUTH0_REDIRECT_URI=https://dev.openpecha.org
```

## Current Steps to Fix the Issue

1. **First, let's get GitHub Pages working with the default domain:**

   ```bash
   # The package.json is now fixed with the correct URL
   # Push the changes and enable GitHub Pages
   git add .
   git commit -m "Fix GitHub Pages configuration"
   git push origin main
   ```

2. **Enable GitHub Pages:**

   - Go to repository **Settings** → **Pages**
   - Set source to **"GitHub Actions"**
   - Wait for deployment (check Actions tab)

3. **Test the default domain:**

   ```
   https://openpecha.github.io/openpecha_evalai_frontend
   ```

4. **Once working, optionally set up custom domain** (requires DNS access to openpecha.org)

## Troubleshooting

### GitHub Pages Not Enabled

- Repository must be public or you need GitHub Pro
- Go to Settings → Pages and select "GitHub Actions" as source

### DNS Propagation

- DNS changes can take up to 48 hours to propagate
- Use online DNS checker tools to verify

### Certificate Issues

- GitHub automatically provides SSL certificates
- May take a few minutes after DNS is configured

### Build Failures

- Check the Actions tab for build errors
- Ensure all environment variables are set correctly

## Quick Fix Summary

1. ✅ Updated package.json with correct GitHub Pages URL
2. 🔄 Push changes to GitHub
3. 🔧 Enable GitHub Pages in repository settings
4. ✅ Your app will work at: `https://openpecha.github.io/openpecha_evalai_frontend`
5. 🌐 Optionally set up custom domain later (requires DNS access)
