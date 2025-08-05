# DNS Setup Guide for eval.pecha.tools

## 🎯 **Your Situation:**

- Domain: `pecha.tools` (already exists on Cloudflare)
- Subdomain needed: `eval.pecha.tools`
- Target: GitHub Pages for OpenPecha EvalAI

## 🛠️ **Cloudflare DNS Setup**

### Step 1: Access Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Click on the `pecha.tools` domain
3. Navigate to **DNS** → **Records**

### Step 2: Add CNAME Record (Recommended)

```
Type: CNAME
Name: eval
Content: openpecha.github.io
Proxy status: DNS only (gray cloud icon)
TTL: Auto
```

**⚠️ Important:**

- Use **"DNS only"** (gray cloud), NOT proxied (orange cloud)
- GitHub Pages requires direct DNS resolution

### Step 3: Alternative A Records (if CNAME fails)

If CNAME doesn't work, delete it and add these 4 A records:

```
Type: A, Name: eval, Content: 185.199.108.153
Type: A, Name: eval, Content: 185.199.109.153
Type: A, Name: eval, Content: 185.199.110.153
Type: A, Name: eval, Content: 185.199.111.153
```

## ⏱️ **Timeline**

- **Immediate**: DNS record added in Cloudflare
- **5-15 minutes**: Cloudflare propagation
- **Up to 24 hours**: Global DNS propagation
- **Usually works in**: 15 minutes to 2 hours

## 🔍 **How to Check Progress**

### 1. Test DNS Resolution

```bash
# Windows Command Prompt
nslookup eval.pecha.tools

# Should show openpecha.github.io or GitHub IPs
```

### 2. Online DNS Checker

- Visit: https://dnschecker.org/
- Enter: `eval.pecha.tools`
- Check multiple locations

### 3. Direct Test

Once DNS works, try: https://eval.pecha.tools

## 🚨 **Troubleshooting**

### DNS Not Resolving

- Wait 15 more minutes (Cloudflare is usually fast)
- Check proxy status is "DNS only" (gray cloud)
- Try A records instead of CNAME

### SSL Certificate Issues

- GitHub auto-provisions SSL after DNS verification
- Takes 5-10 minutes after DNS works
- Check repository **Settings** → **Pages** for status

### 404 Errors

- Ensure GitHub Pages is enabled in repository settings
- Check custom domain is set to `eval.pecha.tools`
- Verify CNAME file exists in public folder

## 📋 **Verification Checklist**

1. **DNS Record Added in Cloudflare**

   - [ ] CNAME: eval → openpecha.github.io (DNS only)
   - [ ] OR A records pointing to GitHub IPs

2. **GitHub Repository Settings**

   - [ ] Pages enabled with GitHub Actions source
   - [ ] Custom domain: `eval.pecha.tools`
   - [ ] Enforce HTTPS checked

3. **DNS Working**

   - [ ] `nslookup eval.pecha.tools` resolves
   - [ ] Multiple DNS checkers show resolution

4. **SSL Certificate**

   - [ ] GitHub shows certificate is active
   - [ ] https://eval.pecha.tools loads without SSL errors

5. **App Working**
   - [ ] Home page loads
   - [ ] React Router navigation works
   - [ ] Auth0 authentication works

## 🎯 **Quick Commands to Test**

```bash
# Test DNS
nslookup eval.pecha.tools

# Test with dig (if available)
dig eval.pecha.tools

# Ping test
ping eval.pecha.tools
```

## 📞 **Need Help?**

If DNS still doesn't work after 1 hour:

1. Screenshot your Cloudflare DNS settings
2. Run `nslookup eval.pecha.tools` and share output
3. Check if you have DNS management permissions for pecha.tools

**Your app will be live at: https://eval.pecha.tools** 🚀

## ⚡ **Testing Right Now**

While waiting for DNS, you can test the app at:
**https://openpecha.github.io/openpecha_evalai_frontend**

This lets you verify:

- ✅ React Router works perfectly
- ✅ All pages load correctly
- ✅ Navigation between routes works
- ✅ Auth0 integration works (with proper URLs)

Once DNS propagates, simply switch back to the custom domain!
