# Buddhist AI Arena - Frontend

A modern React-based web application for the Buddhist AI Arena evaluation platform, built with Vite, TypeScript, and TailwindCSS.

## 🚀 Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** TailwindCSS 4.1
- **Authentication:** Auth0
- **State Management:** TanStack React Query
- **Routing:** React Router v7
- **Internationalization:** react-i18next
- **UI Components:** Custom components with Radix UI primitives
- **Icons:** Lucide React & React Icons
- **Charts:** Recharts
- **Feedback Widget:** Userback

## 📋 Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Auth0 account and application credentials

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd arena/frontend
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configure environment variables**

   Create a `.env` file in the `frontend` directory with the following variables:

   ```env
   # Auth0 Configuration (Required)
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-auth0-api-audience
   VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback

   # Userback Widget (Optional - for user feedback)
   VITE_USERBACK_ID=your-userback-id

   # Preview Server Port (Optional - defaults to 10000)
   PORT=10000
   ```

   **How to get Auth0 credentials:**

   - Sign up at [Auth0](https://auth0.com)
   - Create a new Single Page Application
   - Copy the Domain and Client ID from the application settings
   - Set up the API audience in Auth0 dashboard
   - Add `http://localhost:3000/callback` to the Allowed Callback URLs
   - Add `http://localhost:3000` to the Allowed Web Origins

## 🎯 Available Scripts

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:3000` with hot module replacement (HMR).

The development server includes:

- Hot reload on file changes
- API proxy to `https://eval-api.pecha.ai`
- Source maps for debugging

### Build

```bash
npm run build
```

Creates an optimized production build in the `dist` directory with:

- Minified code
- Source maps
- Asset optimization

### Preview

```bash
npm run preview
# or
npm start
```

Serves the production build locally to test before deployment. Runs on port specified in `PORT` environment variable (default: 10000).

### Lint

```bash
npm run lint
```

Runs ESLint to check code quality and consistency.

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
│   ├── font/           # Custom fonts (Monlam, Product Sans, Poppins)
│   └── ...            # Icons and manifest files
├── src/
│   ├── api/           # API client functions
│   ├── auth/          # Authentication context and hooks
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization setup
│   ├── lib/           # Utility libraries
│   ├── locales/       # Translation files (en.json, bo.json)
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper functions
│   ├── app.tsx        # Main app component
│   └── main.tsx       # Application entry point
├── dist/              # Production build output
├── .env               # Environment variables (create this)
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # TailwindCSS configuration
└── package.json       # Dependencies and scripts
```

## 🔑 Key Features

- **Authentication:** Secure Auth0 integration with refresh tokens
- **Internationalization:** Support for multiple languages (English, Tibetan, Chinese, etc.)
- **Real-time Updates:** React Query for efficient data fetching and caching
- **Responsive Design:** Mobile-first approach with TailwindCSS
- **Model Comparison:** Side-by-side comparison of AI model outputs
- **Leaderboards:** Score and vote-based ranking systems
- **Template Builder:** Create and manage evaluation templates
- **User Feedback:** Integrated Userback widget for collecting user feedback

## 🌐 API Configuration

The development server proxies API requests to `https://eval-api.pecha.ai`.

- **Proxy Rule:** Requests to `/api/*` are forwarded to the backend
- **Backend URL:** https://eval-api.pecha.ai
- **Authentication:** JWT tokens from Auth0

## 🎨 Custom Fonts

The application includes custom fonts:

- **Monlam TB Slim** - For Tibetan text
- **Monlam Uni Ou Chan 2** - For Tibetan text
- **Product Sans** - Primary UI font
- **Poppins** - Secondary UI font

Fonts are loaded from the `/public/font` directory.

## 🔍 Development Tips

1. **React Query DevTools:** Available in development mode (bottom-left corner)
2. **Hot Reload:** Changes to source files automatically reload the browser
3. **TypeScript:** Type checking runs automatically - fix errors as they appear
4. **API Calls:** Check Network tab in browser DevTools for debugging
5. **Authentication:** Clear localStorage if you encounter auth issues

## 📦 Build Configuration

### Vite Configuration

- **Port:** Development server runs on port 3000
- **API Proxy:** Auto-proxies `/api` requests to backend
- **Source Maps:** Enabled for debugging
- **Asset Directory:** `dist/assets`

### TailwindCSS Configuration

- Custom color palette
- Custom fonts configured
- Animation utilities
- Responsive breakpoints

## 🚢 Deployment

The application can be deployed to various platforms:

### Static Hosting (Netlify, Vercel, etc.)

1. Build the project:

   ```bash
   npm run build
   ```
2. Deploy the `dist` directory
3. Configure environment variables in your hosting platform
4. Update Auth0 Allowed Callback URLs with your production domain

### Important Deployment Notes

- Set `VITE_AUTH0_REDIRECT_URI` to your production callback URL
- Ensure all environment variables are set in your hosting platform
- The `public/_redirects` file handles SPA routing for Netlify
- CNAME file is included for custom domain configuration

## 🐛 Troubleshooting

### Authentication Issues

- **Problem:** "Login not working"
  - **Solution:** Check Auth0 configuration and callback URLs
  - Clear browser localStorage and cookies

### Build Errors

- **Problem:** "Module not found"

  - **Solution:** Run `npm install` to ensure all dependencies are installed
- **Problem:** "TypeScript errors"

  - **Solution:** Check type definitions and imports

### API Connection Issues

- **Problem:** "API requests failing"
  - **Solution:** Check network tab, verify backend is running
  - Ensure proxy configuration in `vite.config.ts` is correct

## 📝 Environment Variables Reference

| Variable                    | Required | Default                | Description                   |
| --------------------------- | -------- | ---------------------- | ----------------------------- |
| `VITE_AUTH0_DOMAIN`       | Yes      | -                      | Your Auth0 domain             |
| `VITE_AUTH0_CLIENT_ID`    | Yes      | -                      | Auth0 application client ID   |
| `VITE_AUTH0_AUDIENCE`     | Yes      | -                      | Auth0 API audience identifier |
| `VITE_AUTH0_REDIRECT_URI` | No       | `${origin}/callback` | Auth0 callback URL            |
| `VITE_USERBACK_ID`        | No       | -                      | Userback widget token         |
| `PORT`                    | No       | `10000`              | Preview server port           |

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run linter: `npm run lint`
4. Build and test: `npm run build && npm run preview`
5. Submit a pull request

## 🆘 Support

For issues and questions:

- Check the troubleshooting section above
- Review the backend API documentation
- Contact the development team

---

**Note:** This application requires a running backend API. See `https://github.com/OpenPecha/openpecha_evalai_backend/README.md` for backend setup instructions.
