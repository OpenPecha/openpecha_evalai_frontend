# Render Deployment Guide

## ✅ Fixed Port Binding Issue

### What was wrong:
- Vite preview server was only listening on `localhost` (127.0.0.1)
- Render needs apps to bind to `0.0.0.0` and use the `PORT` environment variable
- Missing `start` script in package.json

### What we fixed:

#### 1. Updated `vite.config.ts`:
```typescript
preview: {
  port: parseInt(process.env.PORT || "4173"),
  host: "0.0.0.0", // Bind to all network interfaces for deployment
},
```

#### 2. Added `start` script in `package.json`:
```json
"start": "vite preview"
```

#### 3. Created `render.yaml` for automatic deployment

## 🚀 Deployment Steps

### Deploy to Render:
1. Commit your changes to Git and push to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `openpecha-evalai-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)
6. Click "Create Web Service"

## 🔧 Environment Variables (Optional)

If you need to add Auth0 or API configurations:
```
NODE_ENV=production
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_API_BASE_URL=https://eval-api.pecha.tools
```

## 🌐 Custom Domain (Optional)

To use a custom domain like `eval.pecha.tools`:
1. Add the domain in Render dashboard
2. Update your DNS records as instructed by Render
3. SSL certificate will be automatically provisioned

## ✅ Testing Locally

To test the production build locally:
```bash
npm run build
npm start
```

Your app should now work at `http://localhost:4173` and be ready for Render deployment!