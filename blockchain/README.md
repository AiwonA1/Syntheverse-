# Syntheverse Blockchain - L1 Implementation

This directory contains the blockchain implementation for Syntheverse AI, including smart contracts for the Proof-of-Discovery protocol and tokenomics.

## Structure

```
blockchain/
├── smart_contracts/      # Solidity smart contracts
│   ├── SyntheverseToken.sol
│   ├── ProofOfDiscovery.sol
│   └── AIIntegration.sol
├── scripts/              # Deployment scripts
│   └── deploy.js
├── tests/                # Test files
│   └── ProofOfDiscovery.test.js
└── deployments/          # Deployment addresses (generated)
```

## Smart Contracts

### SyntheverseToken.sol
ERC20 token for the Syntheverse ecosystem with:
- Total supply: 90 Trillion tokens
- Multi-epoch distribution (Founders → Pioneer → Public → Ecosystem)
- Dynamic founder allocation based on coherence density
- Epoch progression based on coherence density thresholds

### ProofOfDiscovery.sol
Layer-2 Proof-of-Discovery protocol that:
- Validates non-redundancy of contributions
- Scores discoveries on coherence, density, and novelty
- Distributes token rewards based on discovery quality
- Tracks total coherence density for epoch progression

### AIIntegration.sol
Bridge contract connecting off-chain HHF-AI validation to on-chain protocol:
- Manages validation requests
- Processes AI evaluation scores
- Batch validation support

## Setup

### Prerequisites
- Node.js 18+ and npm
- Hardhat development environment

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

## Deployment

### Local Development (Free Test Environment)

1. Start local Hardhat network:
```bash
npm run node
```

2. In another terminal, deploy contracts:
```bash
npm run deploy:local
```

This will:
- Deploy all contracts to local network
- Set up authorizations
- Save deployment addresses to `blockchain/deployments/deployment-localhost.json`

### Testnet Deployment (Sepolia)

1. Create `.env` file with:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. Deploy:
```bash
npm run deploy:testnet
```

## Usage

### Submitting a Discovery

```javascript
const { ethers } = require("hardhat");

// Get contract instance
const pod = await ethers.getContractAt("ProofOfDiscovery", POD_ADDRESS);

// Compute hashes
const contentHash = ethers.id("Your discovery content");
const fractalHash = ethers.id("Your fractal embedding");

// Submit
const tx = await pod.submitDiscovery(contentHash, fractalHash);
await tx.wait();
```

### Validating a Discovery

```javascript
// Validate with AI scores (0-10000 scale)
await pod.validateDiscovery(
    discoveryId,
    800,  // coherence
    500,  // density
    400   // novelty
);
```

## AI Integration

See `hhf-ai/integration/blockchain_bridge.py` for Python integration with HHF-AI system.

## Testing

Run the test suite:
```bash
npm run test
```

Tests cover:
- Token deployment and epoch management
- Discovery submission and validation
- Redundancy checking
- Reward distribution
- AI integration workflow

## Network Configuration

The project supports:
- **Hardhat Network**: Local development (chainId: 1337)
- **Sepolia Testnet**: Public test network (chainId: 11155111)

Both are free to use for testing.

## Next Steps

1. Integrate with actual HHF-AI evaluation system
2. Implement fractal embedding hashing
3. Add ZK-proof support for privacy-preserving validations
4. Deploy to public testnet for community testing


