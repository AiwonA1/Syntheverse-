#!/bin/bash

# Script to test Syntheverse with research papers
# This will start the blockchain, deploy contracts, and test with papers

echo "=== Syntheverse Paper Test Runner ==="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Compile contracts
echo "Compiling contracts..."
npm run compile
echo ""

# Start blockchain in background
echo "Starting local blockchain..."
npm run node > blockchain.log 2>&1 &
BLOCKCHAIN_PID=$!
echo "Blockchain started (PID: $BLOCKCHAIN_PID)"
echo "Waiting for blockchain to be ready..."
sleep 5
echo ""

# Deploy contracts
echo "Deploying contracts..."
npm run deploy:local
echo ""

# Run paper test
echo "Running paper discovery test..."
echo ""
npx hardhat run blockchain/scripts/test_with_papers.js --network localhost

# Cleanup
echo ""
echo "Stopping blockchain..."
kill $BLOCKCHAIN_PID 2>/dev/null
echo "Test complete!"

