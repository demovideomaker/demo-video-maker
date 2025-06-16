#!/bin/bash

echo "🎬 Demo Video Automation - Quick Start"
echo "====================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the tool
echo ""
echo "🔨 Building the tool..."
npm run build

# Install demo app dependencies
echo ""
echo "📦 Installing demo app dependencies..."
cd demo-app
npm install

# Instructions
echo ""
echo "✨ Setup complete!"
echo ""
echo "To try the demo:"
echo "1. In one terminal, start the demo app:"
echo "   cd demo-app && npm run dev"
echo ""
echo "2. In another terminal, generate demo videos:"
echo "   npm run demo ./demo-app http://localhost:3000"
echo ""
echo "Happy demo recording! 🎥"