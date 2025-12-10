#!/bin/bash

# Syntheverse AI - Setup Script
# This script sets up the development environment

echo "=== Syntheverse AI Setup ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✓ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Check Python (optional)
if command -v python3 &> /dev/null; then
    echo "✓ Python $(python3 --version) detected"
    echo "Installing Python dependencies (optional)..."
    
    if [ -d "hhf-ai/integration" ]; then
        cd hhf-ai/integration
        pip3 install -r requirements.txt 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✓ Python dependencies installed"
        else
            echo "⚠ Python dependencies installation failed (optional)"
        fi
        cd ../..
    fi
    echo ""
fi

# Compile contracts
echo "Compiling smart contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile contracts"
    exit 1
fi

echo "✓ Contracts compiled"
echo ""

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Start local blockchain: npm run node"
echo "2. In another terminal, deploy contracts: npm run deploy:local"
echo "3. Run tests: npm run test"
echo ""
echo "See QUICKSTART.md for detailed instructions."




