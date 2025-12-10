# Syntheverse AI - Quick Start Guide

Get Syntheverse AI running on a local L1 blockchain test environment in minutes!

> 📖 **For complete documentation**, see [TEST_ENVIRONMENT_GUIDE.md](./TEST_ENVIRONMENT_GUIDE.md) - includes full API reference, advanced usage, troubleshooting, and examples.

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for AI integration, optional)

## Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Install Python dependencies (optional, for AI integration):**
```bash
cd hhf-ai/integration
pip install -r requirements.txt
cd ../..
```

## Running the Test Environment

### Step 1: Start Local Blockchain

Open a terminal and run:
```bash
npm run node
```

This starts a local Hardhat network on `http://127.0.0.1:8545` with 20 test accounts, each with 10,000 ETH.

### Step 2: Deploy Contracts

In a new terminal, deploy the contracts:
```bash
npm run deploy:local
```

You should see output like:
```
Deploying contracts with account: 0x...
SyntheverseToken deployed to: 0x...
ProofOfDiscovery deployed to: 0x...
AIIntegration deployed to: 0x...
```

Deployment addresses are saved to `blockchain/deployments/deployment-localhost.json`.

### Step 3: Run Tests

Verify everything works:
```bash
npm run test
```

## Example: Submit a Discovery

Create a file `example.js`:

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Load deployment addresses
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract instances
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Submit a discovery
  const contentHash = ethers.id("My novel discovery about fractal structures");
  const fractalHash = ethers.id("Fractal embedding data");
  
  console.log("Submitting discovery...");
  const tx = await pod.submitDiscovery(contentHash, fractalHash);
  const receipt = await tx.wait();
  
  // Extract discovery ID from event
  const event = receipt.logs.find(log => {
    try {
      const parsed = pod.interface.parseLog(log);
      return parsed && parsed.name === "DiscoverySubmitted";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const discoveryId = event.args[0];
    console.log("Discovery submitted! ID:", discoveryId);
    
    // Validate it (with mock scores)
    console.log("Validating discovery...");
    await pod.validateDiscovery(discoveryId, 800, 500, 400);
    
    const discovery = await pod.getDiscovery(discoveryId);
    console.log("Discovery validated:", discovery.validated);
    console.log("Coherence:", discovery.coherenceScore.toString());
    console.log("Density:", discovery.densityScore.toString());
    console.log("Novelty:", discovery.noveltyScore.toString());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run it:
```bash
npx hardhat run example.js --network localhost
```

## Network Options

### Local Network (Free, Recommended for Development)
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: 1337
- **No setup required** - just run `npm run node`

### Sepolia Testnet (Free Public Testnet)
1. Get a free RPC endpoint from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
2. Create `.env` file:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```
3. Deploy: `npm run deploy:testnet`

## Project Structure

```
Syntheverse-/
├── blockchain/
│   ├── smart_contracts/     # Solidity contracts
│   ├── scripts/              # Deployment scripts
│   ├── tests/                # Test files
│   └── deployments/          # Deployment addresses
├── hhf-ai/
│   └── integration/          # AI-Blockchain bridge
├── package.json
├── hardhat.config.js
└── README.md
```

## Next Steps

1. **Integrate HHF-AI**: Connect the actual AI evaluation system
2. **Add More Tests**: Expand test coverage
3. **Deploy to Testnet**: Test on public Sepolia network
4. **Build Frontend**: Create a UI for submitting discoveries

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` again

**"Network not found" errors:**
- Make sure Hardhat node is running (`npm run node`)

**"Insufficient funds" errors:**
- Local network accounts have 10,000 ETH by default
- For testnet, ensure your account has Sepolia ETH (get from faucet)

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Web3.py Documentation](https://web3py.readthedocs.io)

## Support

For issues or questions, open an issue on GitHub or check the main README.md.

