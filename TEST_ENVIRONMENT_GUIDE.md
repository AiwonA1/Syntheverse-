# Syntheverse AI - Complete Test Environment Guide

## Table of Contents
1. [Overview](#overview)
2. [What is the Test Environment?](#what-is-the-test-environment)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Running the Test Environment](#running-the-test-environment)
6. [Using the System](#using-the-system)
7. [API Reference](#api-reference)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Usage](#advanced-usage)

---

## Overview

The Syntheverse AI test environment is a complete L1 blockchain implementation that allows you to test and interact with the Syntheverse Proof-of-Discovery protocol in a free, local development environment. It includes:

- **Local blockchain network** (Hardhat) with instant transactions
- **Smart contracts** for tokenomics and discovery validation
- **AI integration bridge** for connecting HHF-AI evaluations
- **Complete test suite** for verification
- **Example scripts** for common operations

This environment is **100% free** and requires no external services or API keys for local development.

---

## What is the Test Environment?

### Components

#### 1. **Hardhat Local Blockchain Network**
- A local Ethereum-compatible blockchain running on your machine
- Chain ID: 1337
- 20 pre-funded test accounts (10,000 ETH each)
- Instant block times (no mining delays)
- Perfect for rapid development and testing

#### 2. **Smart Contracts**

**SyntheverseToken (ERC20)**
- Total supply: 90 Trillion tokens
- Multi-epoch distribution system:
  - **Founders Epoch**: Dynamic allocation based on coherence density
  - **Pioneer Epoch**: 10% of total supply
  - **Public Epoch**: 40% of total supply
  - **Ecosystem Epoch**: 50% of total supply
- Automatic epoch progression when coherence density thresholds are met

**ProofOfDiscovery (Layer-2 Protocol)**
- Validates discoveries for non-redundancy
- Scores contributions on three dimensions:
  - **Coherence**: Structural consistency and symbolic alignment (0-10000)
  - **Density**: Structural + informational density (0-10000)
  - **Novelty**: Uniqueness relative to existing discoveries (0-10000)
- Distributes token rewards based on discovery quality
- Tracks total coherence density for epoch progression

**AIIntegration (Bridge Contract)**
- Connects off-chain HHF-AI system to on-chain protocol
- Manages validation request queue
- Processes batch validations
- Authorized validator management

#### 3. **AI Integration Bridge (Python)**
- Python library for connecting HHF-AI to blockchain
- Computes content and fractal hashes
- Evaluates discoveries using HHF-AI algorithms
- Submits validations to blockchain

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Syntheverse Test Environment               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Hardhat    │         │   Smart      │            │
│  │   Network    │◄────────┤   Contracts  │            │
│  │  (Local L1)  │         │              │            │
│  └──────────────┘         └──────────────┘            │
│         │                        ▲                       │
│         │                        │                       │
│         ▼                        │                       │
│  ┌──────────────┐         ┌──────┴──────┐              │
│  │  Test        │         │  AI         │              │
│  │  Scripts     │         │  Integration│              │
│  │  & Examples  │         │  Bridge     │              │
│  └──────────────┘         └─────────────┘              │
│                                  ▲                       │
│                                  │                       │
│                          ┌───────┴────────┐            │
│                          │   HHF-AI       │            │
│                          │   System       │            │
│                          │  (Off-chain)   │            │
│                          └────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Discovery Submission**:
   ```
   User → Content + Fractal Embedding → Hash → ProofOfDiscovery.submitDiscovery()
   ```

2. **AI Validation**:
   ```
   Discovery → AIIntegration → HHF-AI Evaluation → Scores → ProofOfDiscovery.validateDiscovery()
   ```

3. **Reward Distribution**:
   ```
   Validated Discovery → Calculate Reward → SyntheverseToken.distributeTokens()
   ```

4. **Epoch Progression**:
   ```
   Coherence Density → Check Threshold → SyntheverseToken.advanceEpoch()
   ```

---

## Installation & Setup

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** (optional, for AI integration)
- **Git** (for cloning the repository)

### Step 1: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# (Optional) Install Python dependencies for AI integration
cd hhf-ai/integration
pip install -r requirements.txt
cd ../..
```

### Step 2: Verify Installation

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

### Step 3: Compile Contracts

```bash
npm run compile
```

This compiles all Solidity contracts and generates artifacts in `blockchain/artifacts/`.

---

## Running the Test Environment

### Option 1: Quick Start (Recommended)

**Terminal 1 - Start Blockchain:**
```bash
npm run node
```

This starts the Hardhat network on `http://127.0.0.1:8545`. You'll see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**Terminal 2 - Deploy Contracts:**
```bash
npm run deploy:local
```

Output:
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SyntheverseToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ProofOfDiscovery deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
AIIntegration deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**Terminal 3 - Run Tests:**
```bash
npm run test
```

### Option 2: Using Testnet (Sepolia)

1. Get a free RPC endpoint from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)

2. Create `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key (optional, for verification)
```

3. Deploy:
```bash
npm run deploy:testnet
```

---

## Using the System

### Basic Workflow

#### 1. Submit a Discovery

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function submitDiscovery() {
  // Load deployment addresses
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const [signer] = await ethers.getSigners();
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Your discovery content
  const content = "A novel insight about hydrogen-holographic structures";
  const fractalEmbedding = "Fractal data: coherence=0.85, density=0.72";
  
  // Compute hashes
  const contentHash = ethers.id(content);
  const fractalHash = ethers.id(fractalEmbedding);
  
  // Submit
  const tx = await pod.submitDiscovery(contentHash, fractalHash);
  const receipt = await tx.wait();
  
  // Get discovery ID from event
  const event = receipt.logs.find(log => {
    const parsed = pod.interface.parseLog(log);
    return parsed && parsed.name === "DiscoverySubmitted";
  });
  
  const discoveryId = event.args[0];
  console.log("Discovery ID:", discoveryId);
  
  return discoveryId;
}
```

#### 2. Validate a Discovery

```javascript
async function validateDiscovery(discoveryId) {
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Validate with AI scores (0-10000 scale)
  await pod.validateDiscovery(
    discoveryId,
    850,  // coherence
    720,  // density
    910   // novelty
  );
  
  // Check status
  const discovery = await pod.getDiscovery(discoveryId);
  console.log("Validated:", discovery.validated);
  console.log("Scores:", {
    coherence: discovery.coherenceScore.toString(),
    density: discovery.densityScore.toString(),
    novelty: discovery.noveltyScore.toString()
  });
}
```

#### 3. Check Token Balance

```javascript
async function checkBalance(address) {
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  
  const balance = await token.balanceOf(address);
  console.log("Balance:", ethers.formatEther(balance), "SYNTH");
}
```

### Using the Example Script

A complete example is provided:

```bash
# Make sure blockchain is running (npm run node)
# Make sure contracts are deployed (npm run deploy:local)

# Run example
npx hardhat run blockchain/scripts/example_usage.js --network localhost
```

This script demonstrates:
- Submitting a discovery
- Validating with scores
- Checking token balances
- Viewing coherence density
- Checking epoch status

---

## API Reference

### SyntheverseToken Contract

**Key Functions:**

```solidity
// Get current epoch (0=Founders, 1=Pioneer, 2=Public, 3=Ecosystem)
function currentEpoch() external view returns (uint8)

// Update coherence density (called by PoD contract)
function updateCoherenceDensity(uint256 newDensity) external

// Distribute tokens for an epoch
function distributeTokens(Epoch epoch, address recipient, uint256 amount) external

// Get token balance
function balanceOf(address account) external view returns (uint256)

// Get coherence density
function coherenceDensity() external view returns (uint256)
```

### ProofOfDiscovery Contract

**Key Functions:**

```solidity
// Submit a discovery
function submitDiscovery(bytes32 contentHash, bytes32 fractalHash) 
    external returns (bytes32)

// Validate a discovery (requires authorization)
function validateDiscovery(
    bytes32 discoveryId,
    uint256 coherenceScore,
    uint256 densityScore,
    uint256 noveltyScore
) external

// Get discovery details
function getDiscovery(bytes32 discoveryId) 
    external view returns (Discovery memory)

// Get total discovery count
function getDiscoveryCount() external view returns (uint256)

// Get total coherence density
function totalCoherenceDensity() external view returns (uint256)
```

### AIIntegration Contract

**Key Functions:**

```solidity
// Request validation for a discovery
function requestValidation(
    bytes32 discoveryId,
    bytes32 contentHash,
    bytes32 fractalHash,
    address discoverer
) external

// Process validation with AI scores
function processValidation(
    bytes32 discoveryId,
    uint256 coherenceScore,
    uint256 densityScore,
    uint256 noveltyScore
) external

// Get pending validation requests
function getPendingRequests(uint256 offset, uint256 limit) 
    external view returns (bytes32[])
```

---

## Examples

### Example 1: Complete Discovery Workflow

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function completeWorkflow() {
  // Setup
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  const [discoverer, validator] = await ethers.getSigners();
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // 1. Submit discovery
  const content = "Novel fractal insight";
  const contentHash = ethers.id(content);
  const fractalHash = ethers.id("fractal-data");
  
  const submitTx = await pod.connect(discoverer).submitDiscovery(
    contentHash, 
    fractalHash
  );
  const submitReceipt = await submitTx.wait();
  
  // Extract discovery ID
  const event = submitReceipt.logs.find(log => {
    const parsed = pod.interface.parseLog(log);
    return parsed && parsed.name === "DiscoverySubmitted";
  });
  const discoveryId = event.args[0];
  
  console.log("Discovery submitted:", discoveryId);
  
  // 2. Validate discovery
  await pod.connect(validator).validateDiscovery(
    discoveryId,
    800,  // coherence
    600,  // density
    500   // novelty
  );
  
  console.log("Discovery validated!");
  
  // 3. Check reward
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  const balance = await token.balanceOf(discoverer.address);
  console.log("Reward:", ethers.formatEther(balance), "SYNTH");
}

completeWorkflow();
```

### Example 2: Batch Validation

```javascript
async function batchValidate() {
  const aiIntegration = await ethers.getContractAt(
    "AIIntegration",
    deployment.contracts.AIIntegration
  );
  
  // Get pending requests
  const pending = await aiIntegration.getPendingRequests(0, 10);
  
  // Prepare batch data
  const discoveryIds = pending;
  const coherenceScores = [800, 750, 900];
  const densityScores = [600, 550, 700];
  const noveltyScores = [500, 450, 600];
  
  // Batch process
  await aiIntegration.batchProcessValidation(
    discoveryIds,
    coherenceScores,
    densityScores,
    noveltyScores
  );
}
```

### Example 3: Monitor Epoch Progression

```javascript
async function monitorEpoch() {
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  
  const epoch = await token.currentEpoch();
  const density = await token.coherenceDensity();
  const threshold = await token.coherenceDensityThreshold();
  
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  
  console.log("Current Epoch:", epochNames[epoch]);
  console.log("Coherence Density:", density.toString());
  console.log("Threshold:", threshold.toString());
  console.log("Progress:", 
    ((Number(density) / Number(threshold)) * 100).toFixed(2) + "%");
  
  if (density >= threshold && epoch < 3) {
    console.log("⚠ Epoch can be advanced!");
  }
}
```

### Example 4: Python AI Integration

```python
from blockchain_bridge import SyntheverseBlockchainBridge

# Initialize bridge
bridge = SyntheverseBlockchainBridge(
    rpc_url="http://127.0.0.1:8545",
    private_key=os.getenv("PRIVATE_KEY")
)

# Load contracts
bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")

# Submit discovery
content = "Novel HHF-AI insight"
fractal_embedding = {"coherence": 0.85, "density": 0.72, "novelty": 0.91}

tx_hash = bridge.submit_discovery(content, fractal_embedding)
print(f"Submitted: {tx_hash}")

# Evaluate with HHF-AI
coherence, density, novelty = bridge.evaluate_discovery(content, fractal_embedding)
print(f"Scores: C={coherence}, D={density}, N={novelty}")

# Validate
validation_tx = bridge.validate_discovery(discovery_id, coherence, density, novelty)
print(f"Validated: {validation_tx}")
```

---

## Troubleshooting

### Common Issues

**1. "Network not found" error**
- **Solution**: Make sure Hardhat node is running (`npm run node`)

**2. "Contract not deployed" error**
- **Solution**: Run `npm run deploy:local` first

**3. "Insufficient funds" error**
- **Solution**: Local network accounts have 10,000 ETH by default. If using testnet, get Sepolia ETH from a faucet

**4. "Cannot find module" errors**
- **Solution**: Run `npm install` again

**5. Contracts won't compile**
- **Solution**: 
  ```bash
  rm -rf blockchain/cache blockchain/artifacts
  npm run compile
  ```

**6. "Transaction reverted" errors**
- **Check**: 
  - Are you using the correct network?
  - Is the contract address correct?
  - Are you authorized to call the function?

### Debugging Tips

**View contract state:**
```javascript
const discovery = await pod.getDiscovery(discoveryId);
console.log(discovery);
```

**Check transaction receipt:**
```javascript
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
console.log("Events:", receipt.logs);
```

**Listen to events:**
```javascript
pod.on("DiscoverySubmitted", (discoveryId, discoverer, contentHash, fractalHash) => {
  console.log("New discovery:", discoveryId);
});
```

---

## Advanced Usage

### Custom Network Configuration

Edit `hardhat.config.js`:

```javascript
networks: {
  custom: {
    url: "http://localhost:8545",
    chainId: 1337,
    accounts: {
      mnemonic: "your mnemonic here",
      count: 10
    }
  }
}
```

### Gas Optimization

Contracts are compiled with optimizer enabled (200 runs). To adjust:

```javascript
solidity: {
  settings: {
    optimizer: {
      enabled: true,
      runs: 200  // Adjust for size vs. gas tradeoff
    }
  }
}
```

### Event Filtering

```javascript
// Filter discoveries by discoverer
const filter = pod.filters.DiscoverySubmitted(null, discovererAddress);
const events = await pod.queryFilter(filter, fromBlock, toBlock);
```

### Contract Upgrades (Future)

For production, consider using upgradeable contracts (OpenZeppelin Upgrades):

```javascript
const { upgrades } = require("hardhat");

const TokenV2 = await ethers.getContractFactory("SyntheverseTokenV2");
const upgraded = await upgrades.upgradeProxy(tokenAddress, TokenV2);
```

### Integration Testing

Create integration tests in `blockchain/tests/integration/`:

```javascript
describe("End-to-End Discovery Flow", function() {
  it("Should complete full discovery lifecycle", async function() {
    // Submit → Validate → Reward → Epoch Check
  });
});
```

---

## Next Steps

1. **Integrate Real HHF-AI**: Replace mock evaluation with actual HHF-AI algorithms
2. **Add Frontend**: Build a web UI for submitting discoveries
3. **Deploy to Testnet**: Test on public Sepolia network
4. **Add ZK-Proofs**: Implement privacy-preserving validations
5. **Scale Testing**: Test with hundreds of discoveries

---

## Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **Solidity Docs**: https://docs.soliditylang.org
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Web3.py Docs**: https://web3py.readthedocs.io

---

## Support

For issues or questions:
- Check the [QUICKSTART.md](./QUICKSTART.md) for basic setup
- Review [blockchain/README.md](./blockchain/README.md) for technical details
- Open an issue on GitHub

---

**Happy Testing! 🚀**

