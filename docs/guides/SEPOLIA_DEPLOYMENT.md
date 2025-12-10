# Deploying to Sepolia Testnet

This guide will help you deploy the Syntheverse smart contracts to the Sepolia testnet.

## Prerequisites

1. **Sepolia ETH**: You need Sepolia testnet ETH to pay for gas fees
   - Get free Sepolia ETH from: https://sepoliafaucet.com/ or https://faucet.quicknode.com/ethereum/sepolia
   - You'll need at least 0.1-0.2 Sepolia ETH for deployment

2. **RPC URL**: You need a Sepolia RPC endpoint
   - Free options:
     - Alchemy: https://www.alchemy.com/ (free tier)
     - Infura: https://www.infura.io/ (free tier)
     - QuickNode: https://www.quicknode.com/ (free tier)
     - Public RPC: `https://rpc.sepolia.org` (may be rate-limited)

3. **Private Key**: Your wallet's private key (for the account with Sepolia ETH)
   - ⚠️ **SECURITY WARNING**: Never commit your private key to git!
   - Use a dedicated test account, not your main wallet

4. **Etherscan API Key** (optional, for contract verification):
   - Get from: https://etherscan.io/apis
   - Free tier is sufficient

## Setup Steps

### 1. Create `.env` file

Create a `.env` file in the project root (it's already in `.gitignore`):

```bash
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Optional: For contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Example `.env` file:**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123def456...
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ETHERSCAN_API_KEY=ABCD1234EFGH5678IJKL9012
```

### 2. Get Sepolia ETH

1. Visit a Sepolia faucet: https://sepoliafaucet.com/
2. Enter your wallet address
3. Request testnet ETH (usually 0.5-1 ETH per request)
4. Wait for confirmation (may take a few minutes)

### 3. Verify Your Setup

Check your account balance:
```bash
npx hardhat run blockchain/scripts/check_balance.js --network sepolia
```

Or manually check:
```bash
# Replace YOUR_ADDRESS with your wallet address
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS","latest"],"id":1}' \
  https://rpc.sepolia.org
```

### 4. Deploy Contracts

Deploy all contracts to Sepolia:
```bash
npm run deploy:sepolia
```

This will:
1. Deploy SyntheverseToken
2. Deploy ProofOfDiscovery
3. Deploy AIIntegration
4. Set up all authorizations
5. Save deployment addresses to `blockchain/deployments/deployment-sepolia.json`

### 5. Verify Contracts (Optional)

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
# Verify SyntheverseToken (replace with actual address)
npx hardhat verify --network sepolia \
  0x1234567890123456789012345678901234567890 \
  "0xYourDeployerAddress"

# Verify ProofOfDiscovery
npx hardhat verify --network sepolia \
  0x2345678901234567890123456789012345678901 \
  "0xTokenAddress" "0xYourDeployerAddress"

# Verify AIIntegration
npx hardhat verify --network sepolia \
  0x3456789012345678901234567890123456789012 \
  "0xPoDAddress" "0xYourDeployerAddress"
```

## Deployment Script

The deployment script (`blockchain/scripts/deploy.js`) will:

1. **Deploy SyntheverseToken**
   - Total supply: 90 Trillion SYNTH tokens
   - Epoch distribution: Founders 45T, Pioneer 9T, Public 18T, Ecosystem 18T

2. **Deploy ProofOfDiscovery**
   - Links to SyntheverseToken
   - Sets up epoch qualification thresholds
   - Configures PoD Score calculation

3. **Deploy AIIntegration**
   - Links to ProofOfDiscovery
   - Sets up AI validator authorization

4. **Configure Authorizations**
   - Authorizes ProofOfDiscovery to distribute tokens
   - Sets AIIntegration as AI validator
   - Authorizes deployer as validator

5. **Save Deployment Info**
   - Creates `blockchain/deployments/deployment-sepolia.json`
   - Includes all contract addresses and deployment details

## After Deployment

### Check Deployment

View the deployment file:
```bash
cat blockchain/deployments/deployment-sepolia.json
```

### Interact with Contracts

You can interact with deployed contracts using Hardhat console:

```bash
npx hardhat console --network sepolia
```

Example:
```javascript
const deployment = require('./blockchain/deployments/deployment-sepolia.json');
const token = await ethers.getContractAt('SyntheverseToken', deployment.contracts.SyntheverseToken);
const totalSupply = await token.TOTAL_SUPPLY();
console.log('Total Supply:', ethers.formatEther(totalSupply));
```

### Test on Sepolia

You can run the test script on Sepolia (will use real gas):

```bash
# Make sure you have enough Sepolia ETH
npx hardhat run blockchain/scripts/test_with_papers.js --network sepolia
```

⚠️ **Note**: This will use real Sepolia ETH for gas fees!

## Troubleshooting

### Error: "insufficient funds"
- **Solution**: Get more Sepolia ETH from a faucet

### Error: "nonce too high"
- **Solution**: Wait a few minutes and try again, or reset your nonce

### Error: "network connection failed"
- **Solution**: Check your RPC URL is correct and accessible

### Error: "private key invalid"
- **Solution**: Ensure your private key doesn't have `0x` prefix in `.env`

### Contracts not verifying
- **Solution**: Make sure constructor arguments match exactly
- Try verifying with flattened source code if needed

## Security Best Practices

1. ✅ **Never commit `.env` file** - It's already in `.gitignore`
2. ✅ **Use a dedicated test account** - Don't use your main wallet
3. ✅ **Keep private keys secure** - Store `.env` file securely
4. ✅ **Verify contracts** - Always verify on Etherscan for transparency
5. ✅ **Test thoroughly** - Test on local network first before Sepolia

## Cost Estimate

Approximate gas costs on Sepolia:
- SyntheverseToken deployment: ~2-3M gas (~$0.10-0.15 at 20 gwei)
- ProofOfDiscovery deployment: ~3-4M gas (~$0.15-0.20)
- AIIntegration deployment: ~2-3M gas (~$0.10-0.15)
- Setup transactions: ~500K gas each (~$0.02-0.03)

**Total estimated cost**: ~$0.50-0.75 in Sepolia ETH

## Next Steps

After successful deployment:
1. Share contract addresses with your team
2. Update frontend/backend to use Sepolia addresses
3. Test all functionality on testnet
4. Monitor contract interactions on Etherscan
5. Prepare for mainnet deployment when ready

## Useful Links

- Sepolia Explorer: https://sepolia.etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/
- Alchemy Dashboard: https://dashboard.alchemy.com/
- Hardhat Network Docs: https://hardhat.org/hardhat-network/docs



