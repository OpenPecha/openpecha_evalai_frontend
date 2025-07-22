# GitHub Pages Deployment Guide

## Overview

This guide will help you deploy your OpenPecha EvalAI frontend to GitHub Pages with automatic deployments using GitHub Actions.

## Prerequisites

- GitHub account
- Auth0 account with application configured
- Repository pushed to GitHub

## Method 1: Automatic Deployment with GitHub Actions (Recommended)

### 1. Configure Repository Settings

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**

### 2. Set Up Environment Variables

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier (optional)
VITE_AUTH0_REDIRECT_URI=https://username.github.io/openpecha_evalai_frontend
```

**Important:** Replace `username` with your actual GitHub username in the redirect URI.

### 3. Update Auth0 Configuration

Update your Auth0 application settings with your GitHub Pages URL:

**Allowed Callback URLs:**

```
https://username.github.io/openpecha_evalai_frontend
```

**Allowed Logout URLs:**

```
https://username.github.io/openpecha_evalai_frontend
```

**Allowed Web Origins:**

```
https://username.github.io/openpecha_evalai_frontend
```

**Allowed Origins (CORS):**

```
https://username.github.io/openpecha_evalai_frontend
```

### 4. Update package.json

Replace the homepage URL in `package.json`:

```json
"homepage": "https://your-username.github.io/openpecha_evalai_frontend"
```

### 5. Deploy

1. Commit and push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your app
3. Check the **Actions** tab to monitor the deployment progress
4. Your app will be available at: `https://username.github.io/openpecha_evalai_frontend`

## Method 2: Manual Deployment

### 1. Build the Project

```bash
npm run build
```

### 2. Deploy to GitHub Pages

```bash
npm run deploy
```

This will:

- Build your project
- Push the built files to the `gh-pages` branch
- Make your app available on GitHub Pages

## Custom Domain (Optional)

### 1. Configure Custom Domain

1. Add a `CNAME` file to the `public` folder with your domain:

```
yourdomain.com
```

2. Update your Auth0 configuration with your custom domain
3. Configure DNS settings with your domain provider

### 2. Update Environment Variables

Update the redirect URI in your GitHub secrets:

```
VITE_AUTH0_REDIRECT_URI=https://yourdomain.com
```

## Troubleshooting

### Common Issues:

**1. 404 Error on Page Refresh**

- The `_redirects` file should handle this for SPA routing
- If issues persist, ensure GitHub Pages is configured correctly

**2. Authentication Not Working**

- Verify Auth0 callback URLs include your GitHub Pages domain
- Check that environment variables are set correctly in GitHub secrets
- Ensure the redirect URI matches exactly (with/without trailing slash)

**3. Build Fails**

- Check the Actions tab for error details
- Verify all required environment variables are set
- Ensure no syntax errors in your code

**4. Assets Not Loading**

- Verify the `base` path in `vite.config.ts` matches your repository name
- Check that the homepage in `package.json` is correct

### Debug Steps:

1. **Check GitHub Actions logs:**

   - Go to Actions tab in your repository
   - Click on the failed workflow
   - Expand the failing step to see error details

2. **Verify environment variables:**

   - Ensure all Auth0 secrets are set in repository settings
   - Check that variable names match exactly (case-sensitive)

3. **Test locally:**

   ```bash
   npm run build
   npm run preview
   ```

4. **Check Auth0 configuration:**
   - Verify callback URLs include your GitHub Pages domain
   - Ensure CORS settings are correct

## Environment Variables Reference

| Variable                  | Description                 | Required | Example                                |
| ------------------------- | --------------------------- | -------- | -------------------------------------- |
| `VITE_AUTH0_DOMAIN`       | Your Auth0 domain           | Yes      | `your-domain.auth0.com`                |
| `VITE_AUTH0_CLIENT_ID`    | Auth0 application client ID | Yes      | `abc123...`                            |
| `VITE_AUTH0_AUDIENCE`     | Auth0 API identifier        | No       | `https://api.yourdomain.com`           |
| `VITE_AUTH0_REDIRECT_URI` | Callback URL after login    | Yes      | `https://username.github.io/repo-name` |
| `VITE_APP_NAME`           | Application display name    | No       | `OpenPecha EvalAI`                     |

## Security Notes

- Never commit `.env` files to version control
- Use GitHub Secrets for all sensitive environment variables
- Regularly rotate Auth0 client secrets
- Keep your dependencies updated

## Monitoring

- Monitor deployment status in the Actions tab
- Check GitHub Pages settings for deployment status
- Use browser developer tools to debug any issues
- Monitor Auth0 logs for authentication issues

## Updates and Maintenance

1. **Regular Updates:**

   ```bash
   npm update
   npm audit fix
   ```

2. **Redeploy after changes:**

   - Push to main branch for automatic deployment
   - Or run `npm run deploy` for manual deployment

3. **Monitor dependencies:**
   - Keep React, Vite, and other dependencies updated
   - Test thoroughly after major version updates

Your app should now be successfully deployed to GitHub Pages with automatic deployments! 🚀
