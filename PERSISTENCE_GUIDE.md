# Blockchain Persistence Guide

## Current Status

**⚠️ IMPORTANT:** Hardhat's local node (`npm run node`) does **NOT** persist state between restarts by default. All blockchain data is stored in-memory and is lost when the node stops.

## Testing Persistence

### Current State Snapshot

A snapshot of the current blockchain state has been saved to:
`test_outputs/persistence_snapshot.json`

This includes:
- Total discoveries: 11
- Total coherence density: 898,760
- Current epoch: Ecosystem
- Sample discovery IDs

### To Test Persistence

1. **Check current state:**
   ```bash
   npx hardhat run blockchain/scripts/check_persistence.js --network localhost
   ```

2. **Stop the blockchain:**
   ```bash
   # Find the process
   ps aux | grep "hardhat node"
   # Kill it
   kill <PID>
   ```

3. **Restart the blockchain:**
   ```bash
   npm run node
   ```

4. **Check state again:**
   ```bash
   npx hardhat run blockchain/scripts/check_persistence.js --network localhost
   ```

**Expected Result:** State will be **LOST** (discoveries = 0) because Hardhat node doesn't persist.

## Solutions for Persistence

### Option 1: Use Anvil (Recommended for Local Development)

Anvil (from Foundry) provides built-in persistence:

1. **Install Foundry:**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Start Anvil with persistence:**
   ```bash
   anvil --state ./anvil_state.json
   ```

3. **Update hardhat.config.js:**
   ```javascript
   localhost: {
     url: "http://127.0.0.1:8545",
     chainId: 31337, // Anvil's default chain ID
   }
   ```

4. **Deploy contracts:**
   ```bash
   npm run deploy:local
   ```

**Benefits:**
- ✅ State persists between restarts
- ✅ Fast and compatible with Hardhat
- ✅ Can specify state file location

### Option 2: Use Hardhat Fork with Database (Advanced)

For forking mainnet/testnet with persistence:

```bash
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY \
  --fork-block-number 12345678 \
  --db-path ./hardhat_db
```

**Note:** This is for forking existing networks, not local development.

### Option 3: Deploy to Testnet (Production-like)

For true persistence, deploy to a testnet:

1. **Sepolia Testnet:**
   ```bash
   npm run deploy:sepolia
   ```

2. **State persists permanently** on the testnet

**Benefits:**
- ✅ Permanent persistence
- ✅ Public verification
- ✅ Real-world testing

### Option 4: State Export/Import Script (Workaround)

Create scripts to export and import state:

```bash
# Export state
npx hardhat run blockchain/scripts/export_state.js --network localhost

# Later, import state
npx hardhat run blockchain/scripts/import_state.js --network localhost
```

This would require implementing state export/import functionality.

## Recommended Approach

### For Development:
- **Use Anvil** with `--state` flag for local persistence
- Fast, reliable, and easy to reset when needed

### For Testing:
- **Use Hardhat node** for quick, isolated tests
- Accept that state resets between sessions
- Use test scripts that set up state each time

### For Production:
- **Deploy to testnet/mainnet** for permanent persistence
- Use Sepolia for testing, mainnet for production

## Current Configuration

The current setup uses Hardhat's in-memory node, which means:

- ✅ Fast and convenient for development
- ✅ Easy to reset and start fresh
- ❌ State is lost when node stops
- ❌ No persistence between sessions

## Next Steps

1. **For immediate persistence:** Switch to Anvil
2. **For production testing:** Deploy to Sepolia testnet
3. **For development:** Continue using Hardhat node (accept no persistence)

## Verification

Run the persistence check script to verify current state:

```bash
npx hardhat run blockchain/scripts/check_persistence.js --network localhost
```

This will show:
- Current discovery count
- Coherence density
- Current epoch
- Sample discovery IDs

Compare this output before and after restarting the node to confirm persistence status.

