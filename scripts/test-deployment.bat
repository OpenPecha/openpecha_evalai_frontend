@echo off
REM Test Deployment Script for OpenPecha EvalAI (Windows)
REM This script builds and tests the app locally before deployment

echo 🚀 Testing deployment build for OpenPecha EvalAI...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local not found. Copying from example...
    if exist ".env.local.example" (
        copy ".env.local.example" ".env.local"
        echo 📝 Please edit .env.local with your Auth0 credentials before testing
    ) else (
        echo ❌ .env.local.example not found. Please create .env.local manually
        pause
        exit /b 1
    )
)

REM Build the project
echo 🔨 Building the project...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 🌐 Starting preview server...
    echo 📱 Your app will be available at http://localhost:4173
    echo 🔧 This simulates the production build that will be deployed to GitHub Pages
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    
    npm run preview
) else (
    echo ❌ Build failed! Please check the errors above and fix them before deploying.
    pause
    exit /b 1
) 