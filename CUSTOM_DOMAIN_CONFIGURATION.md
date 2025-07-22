# Custom Domain Configuration: eval.pecha.tools

## ✅ Files Updated for Custom Domain

Your app is now configured to work with `https://eval.pecha.tools`. Here's what has been updated:

### 📝 Configuration Changes:

- ✅ **package.json** - Updated homepage to `https://eval.pecha.tools`
- ✅ **vite.config.ts** - Changed base path to `/` for custom domain
- ✅ **public/CNAME** - Created CNAME file with domain
- ✅ **GitHub Actions** - Updated for custom domain deployment

## 🌐 DNS Configuration Required

You need to configure DNS records for `eval.pecha.tools`:

### Option 1: CNAME Record (Recommended)

```
Type: CNAME
Name: eval
Value: openpecha.github.io
TTL: 3600
```

### Option 2: A Records (Alternative)

If CNAME doesn't work, use these A records:

```
Type: A
Name: eval
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600
```

## 🔧 GitHub Repository Configuration

### 1. Enable GitHub Pages

1. Go to: https://github.com/OpenPecha/openpecha_evalai_frontend
2. **Settings** → **Pages**
3. Source: **GitHub Actions**
4. Custom domain: **eval.pecha.tools**
5. ✅ Check **Enforce HTTPS**

### 2. Environment Variables (GitHub Secrets)

Go to **Settings** → **Secrets and variables** → **Actions** and add:

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_AUTH0_REDIRECT_URI=https://eval.pecha.tools
```

## 🔐 Auth0 Configuration Update

Update your Auth0 application with the new domain:

### Application URLs:

- **Allowed Callback URLs:** `https://eval.pecha.tools`
- **Allowed Logout URLs:** `https://eval.pecha.tools`
- **Allowed Web Origins:** `https://eval.pecha.tools`
- **Allowed Origins (CORS):** `https://eval.pecha.tools`

### Remove Old URLs:

Remove any references to:

- `https://openpecha.github.io/openpecha_evalai_frontend`
- `http://localhost:5173` (keep for development)

## 🚀 Deployment Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Configure custom domain eval.pecha.tools"
git push origin main
```

### 2. Configure DNS

- Add the CNAME record in your DNS provider
- Point `eval` to `openpecha.github.io`

### 3. Enable GitHub Pages

- Go to repository settings and configure custom domain
- GitHub will verify DNS and issue SSL certificate

### 4. Wait for Propagation

- DNS changes can take up to 24 hours
- SSL certificate provisioning: 5-10 minutes after DNS is verified

## 🔍 Verification Steps

### 1. Check DNS Propagation

Use online tools like:

- https://dnschecker.org/
- Search for: `eval.pecha.tools`

### 2. Verify GitHub Pages

- Check the Actions tab for successful deployment
- Green checkmark = successful build and deploy

### 3. Test the App

Once DNS propagates, test:

- https://eval.pecha.tools
- Authentication flow
- All pages and features

## 🚨 Troubleshooting

### Common Issues:

**1. DNS Not Propagating**

- Wait 24 hours for full propagation
- Check with DNS lookup tools
- Verify CNAME record points to `openpecha.github.io`

**2. SSL Certificate Issues**

- GitHub auto-provisions SSL after DNS verification
- May take 5-10 minutes after DNS is verified
- Check repository Pages settings for status

**3. 404 Errors**

- Ensure GitHub Pages is enabled with GitHub Actions source
- Check that CNAME file exists in public folder
- Verify build completed successfully

**4. Authentication Issues**

- Update Auth0 URLs to use new domain
- Check GitHub Secrets are set correctly
- Verify redirect URI matches exactly

### Debug Commands:

```bash
# Test DNS resolution
nslookup eval.pecha.tools

# Check CNAME record
dig eval.pecha.tools CNAME

# Test build locally
npm run build
npm run preview
```

## 🎯 Timeline

1. **Immediate**: Configuration files updated ✅
2. **5 minutes**: Push to GitHub and enable Pages
3. **1-24 hours**: DNS propagation
4. **5-10 minutes after DNS**: SSL certificate provisioning
5. **Ready**: Your app live at https://eval.pecha.tools

## 📋 Checklist

- [ ] DNS CNAME record configured
- [ ] GitHub Pages enabled with custom domain
- [ ] Auth0 URLs updated
- [ ] GitHub Secrets configured
- [ ] Code pushed to main branch
- [ ] Deployment successful (check Actions tab)
- [ ] Domain resolves correctly
- [ ] SSL certificate active
- [ ] App accessible at https://eval.pecha.tools
- [ ] Authentication working

Your app will be available at: **https://eval.pecha.tools** 🚀
