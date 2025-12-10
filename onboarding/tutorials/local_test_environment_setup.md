# Local Test Environment Setup

This tutorial will guide you through setting up the Syntheverse local test environment on your machine.

---

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** (optional, for AI integration)
- **Git** (for cloning the repository)

---

## Step 1: Install Dependencies

### Node.js Dependencies

```bash
# Navigate to project root
cd Syntheverse-

# Install all Node.js dependencies
npm install
```

This installs:
- Hardhat (blockchain development framework)
- OpenZeppelin contracts
- Web3 libraries
- Testing frameworks

### Python Dependencies (Optional)

For HHF-AI integration:

```bash
cd hhf-ai/integration
pip install -r requirements.txt
cd ../..
```

---

## Step 2: Verify Installation

```bash
# Run verification script
node verify_setup.js
```

You should see:
```
✓ Node.js version: v18.x.x
✓ Dependencies installed
✓ Hardhat toolbox installed
✓ Contracts compiled
✓ Setup looks good!
```

---

## Step 3: Compile Contracts

```bash
npm run compile
```

This compiles all Solidity smart contracts and generates artifacts in `blockchain/artifacts/`.

**Expected Output:**
```
Compiled 3 Solidity files successfully
```

---

## Step 4: Start Local Blockchain

Open a terminal and start the Hardhat network:

```bash
npm run node
```

**What This Does:**
- Starts a local Ethereum-compatible blockchain
- Chain ID: 1337
- RPC URL: `http://127.0.0.1:8545`
- 20 pre-funded test accounts (10,000 ETH each)
- Instant block times (no mining delays)

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**Keep this terminal running!**

---

## Step 5: Deploy Contracts

Open a **new terminal** (keep the blockchain running) and deploy:

```bash
cd Syntheverse-
npm run deploy:local
```

**What This Does:**
- Deploys SyntheverseToken contract
- Deploys ProofOfDiscovery contract
- Deploys AIIntegration contract
- Sets up authorizations
- Saves deployment addresses to `blockchain/deployments/deployment-localhost.json`

**Expected Output:**
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SyntheverseToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ProofOfDiscovery deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
AIIntegration deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Deployment completed successfully!
```

---

## Step 6: Verify Deployment

```bash
# Run tests to verify everything works
npm run test
```

**Expected Output:**
```
  Syntheverse Blockchain Tests
    SyntheverseToken
      ✓ Should have correct total supply
      ✓ Should start in Founders epoch
      ✓ Should update coherence density
      ✓ Should advance epoch when threshold is met
    ProofOfDiscovery
      ✓ Should submit a discovery
      ✓ Should reject redundant content
      ✓ Should validate a discovery with sufficient scores
      ✓ Should reject discovery below thresholds
    AIIntegration
      ✓ Should request validation
      ✓ Should process validation through AI integration

  11 passing
```

---

## Step 7: Test with Papers (Optional)

Test the system with research papers:

```bash
npm run test:multiple
```

This will:
- Submit 8 research papers as discoveries
- Validate each with scores
- Calculate PoD Scores
- Distribute token rewards
- Generate comprehensive reports

**Reports saved to:** `test_outputs/`

---

## Configuration

### Network Configuration

The local network is configured in `hardhat.config.js`:

```javascript
localhost: {
  url: "http://127.0.0.1:8545",
  chainId: 1337
}
```

### Environment Variables (Optional)

For testnet deployment, create a `.env` file:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key
```

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Network not found" errors
- Make sure Hardhat node is running (`npm run node`)
- Check that it's running on port 8545

### "Contract not deployed" errors
- Run `npm run deploy:local` first
- Check `blockchain/deployments/deployment-localhost.json` exists

### Contracts won't compile
```bash
# Clean and recompile
rm -rf blockchain/cache blockchain/artifacts
npm run compile
```

### Port 8545 already in use
```bash
# Find and kill the process
lsof -ti:8545 | xargs kill -9
# Or change port in hardhat.config.js
```

---

## Next Steps

1. ✅ Environment is set up
2. 📖 Read [First Discovery Submission](first_discovery_submission.md)
3. 🚀 Submit your first discovery!
4. 💰 Track rewards with [Reward Tracking](reward_tracking.md)

---

## Additional Resources

- **Complete Guide:** [TEST_ENVIRONMENT_GUIDE.md](../../docs/guides/TEST_ENVIRONMENT_GUIDE.md)
- **Quick Start:** [QUICKSTART.md](../../docs/guides/QUICKSTART.md)
- **Persistence:** [PERSISTENCE_GUIDE.md](../../docs/guides/PERSISTENCE_GUIDE.md)

---

**Your local test environment is ready! Time to start discovering.**

