#!/bin/bash

# Test Deployment Script for OpenPecha EvalAI
# This script builds and tests the app locally before deployment

echo "🚀 Testing deployment build for OpenPecha EvalAI..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Copying from example..."
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "📝 Please edit .env.local with your Auth0 credentials before testing"
    else
        echo "❌ .env.local.example not found. Please create .env.local manually"
        exit 1
    fi
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start preview server
    echo "🌐 Starting preview server..."
    echo "📱 Your app will be available at http://localhost:4173"
    echo "🔧 This simulates the production build that will be deployed to GitHub Pages"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    npm run preview
else
    echo "❌ Build failed! Please check the errors above and fix them before deploying."
    exit 1
fi 