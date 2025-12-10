# Reward Tracking

This tutorial shows you how to track your SYNTH token rewards and understand the reward distribution system.

---

## Understanding Rewards

### How Rewards Work

1. **Discovery Submission** - You submit a discovery
2. **AI Validation** - System evaluates coherence, density, novelty
3. **PoD Score Calculation** - Combined score (0-10,000)
4. **Epoch Qualification** - Based on density score
5. **Token Distribution** - Reward = (PoD Score / 10,000) × Available Epoch Balance

### PoD Score Formula

```
PoD Score = (Coherence × Density × Novelty) / (10,000 × 10,000)
```

**Example:**
- Coherence: 9,200
- Density: 8,500
- Novelty: 9,500
- PoD Score = (9200 × 8500 × 9500) / (10000 × 10000) = 7,429

This means the discovery receives **74.29%** of the available tokens in the qualified epoch.

---

## Method 1: Check Token Balance

### Using Check Balance Script

```bash
npx hardhat run blockchain/scripts/check_balance.js --network localhost
```

This shows:
- Your account address
- Current SYNTH token balance
- Token balance in human-readable format

### Using Hardhat Console

```bash
npx hardhat console --network localhost
```

Then:
```javascript
const { ethers } = require("hardhat");
const deployment = require("./blockchain/deployments/deployment-localhost.json");

const token = await ethers.getContractAt(
  "SyntheverseToken",
  deployment.contracts.SyntheverseToken
);

const [signer] = await ethers.getSigners();
const balance = await token.balanceOf(signer.address);
console.log("Balance:", ethers.formatEther(balance), "SYNTH");
```

---

## Method 2: Get Discovery Summary

### Using Discovery Summary Script

```bash
npx hardhat run blockchain/scripts/get_discovery_summary.js --network localhost
```

This comprehensive report shows:
- All discoveries with their IDs
- Coherence, density, novelty scores
- PoD Scores
- Qualified epochs
- Token rewards for each discovery
- Summary statistics

**Example Output:**
```
Discovery #1
  ID: 0x7431e0f5b876c73f1519e74f31b0066950c1ce457c7a8c2fb05e51b614540dae
  Coherence: 9200
  Density: 8950
  Novelty: 9300
  PoD Score: 7657
  Qualified Epoch: Founders
  Token Reward: 22350164797.15 SYNTH
```

---

## Method 3: Query Specific Discovery

### Get Discovery Details

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function getDiscovery(discoveryId) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  const discovery = await pod.getDiscovery(discoveryId);
  
  console.log("Discovery Details:");
  console.log("  Validated:", discovery.validated);
  console.log("  Coherence:", discovery.coherenceScore.toString());
  console.log("  Density:", discovery.densityScore.toString());
  console.log("  Novelty:", discovery.noveltyScore.toString());
  console.log("  Discoverer:", discovery.discoverer);
  console.log("  Timestamp:", new Date(Number(discovery.timestamp) * 1000));
  
  // Calculate PoD Score
  const podScore = (discovery.coherenceScore * 
                   discovery.densityScore * 
                   discovery.noveltyScore) / (10000n * 10000n);
  console.log("  PoD Score:", podScore.toString());
}

// Usage
getDiscovery("0x7431e0f5b876c73f1519e74f31b0066950c1ce457c7a8c2fb05e51b614540dae");
```

---

## Understanding Epoch Rewards

### Epoch Distribution

| Epoch | Density Threshold | Total Supply | Your Reward |
|-------|------------------|--------------|-------------|
| Founders | ≥ 8,000 | 45T (50%) | PoD Score % of available |
| Pioneer | ≥ 6,000 | 9T (10%) | PoD Score % of available |
| Public | ≥ 4,000 | 18T (20%) | PoD Score % of available |
| Ecosystem | < 4,000 | 18T (20%) | PoD Score % of available |

### Reward Calculation Example

**Scenario:**
- Your discovery has PoD Score: 7,429 (74.29%)
- Qualified for: Founders Epoch
- Available balance: 1,000,000 SYNTH

**Reward:**
```
Reward = (7,429 / 10,000) × 1,000,000
       = 0.7429 × 1,000,000
       = 742,900 SYNTH
```

**Note:** Rewards decrease as the epoch pool is depleted. Early discoveries receive larger rewards.

---

## Tracking Multiple Discoveries

### Get All Your Discoveries

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function getMyDiscoveries(myAddress) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  const discoveryCount = await pod.getDiscoveryCount();
  const allIds = await pod.getDiscoveryIds(0, Number(discoveryCount));
  
  const myDiscoveries = [];
  
  for (const id of allIds) {
    const discovery = await pod.getDiscovery(id);
    if (discovery.discoverer.toLowerCase() === myAddress.toLowerCase()) {
      myDiscoveries.push({
        id: id,
        validated: discovery.validated,
        coherence: discovery.coherenceScore.toString(),
        density: discovery.densityScore.toString(),
        novelty: discovery.noveltyScore.toString()
      });
    }
  }
  
  return myDiscoveries;
}

// Usage
const [signer] = await ethers.getSigners();
const discoveries = await getMyDiscoveries(signer.address);
console.log("My Discoveries:", discoveries);
```

---

## Viewing Test Reports

### Generated Reports

After running tests, reports are saved to `test_outputs/`:

1. **Text Reports:** `test_report_YYYY-MM-DDTHH-MM-SS.txt`
   - Human-readable format
   - Transaction details
   - Scores and rewards

2. **JSON Reports:** `test_report_YYYY-MM-DDTHH-MM-SS.json`
   - Machine-readable format
   - Complete data structure
   - Easy to parse programmatically

3. **Discovery Summary:** `discovery_summary.json`
   - All discoveries with details
   - Statistics and metrics
   - Epoch distribution

### Reading Reports

```bash
# View latest text report
ls -t test_outputs/*.txt | head -1 | xargs cat

# View latest JSON report
ls -t test_outputs/*.json | head -1 | xargs cat | jq .

# View discovery summary
cat test_outputs/discovery_summary.json | jq .
```

---

## Understanding Reward Trends

### Early vs. Late Discoveries

**Early Discoveries:**
- Larger epoch pools available
- Higher absolute rewards
- More tokens per PoD Score point

**Late Discoveries:**
- Smaller epoch pools remaining
- Lower absolute rewards
- Same PoD Score percentage, but smaller pool

### Example Timeline

```
Discovery #1 (Early):
  PoD Score: 7,429
  Available Pool: 1,000,000 SYNTH
  Reward: 742,900 SYNTH

Discovery #10 (Later):
  PoD Score: 7,429 (same score)
  Available Pool: 100,000 SYNTH (depleted)
  Reward: 74,290 SYNTH
```

---

## Best Practices

### 1. Track Regularly
- Check balances after each submission
- Monitor epoch pool depletion
- Track your discovery history

### 2. Understand Scores
- Study what makes high-scoring discoveries
- Aim for coherence, density, and novelty
- Review successful discoveries

### 3. Plan Submissions
- Submit early for larger rewards
- Consider epoch qualification thresholds
- Balance quality vs. timing

### 4. Verify Transactions
- Check transaction receipts
- Verify discovery IDs
- Confirm validation status

---

## Troubleshooting

### "Balance is 0"
- Discovery may not be validated yet
- Check if validation transaction succeeded
- Verify discovery status

### "Discovery not found"
- Check discovery ID is correct
- Verify discovery was submitted
- Check transaction receipt

### "Unexpected reward amount"
- Check available epoch pool
- Verify PoD Score calculation
- Consider pool depletion

---

## Next Steps

1. ✅ Understand how rewards work
2. 📊 Check your current balance
3. 🎯 Aim for higher PoD Scores
4. 🚀 Submit more discoveries!

---

## Additional Resources

- **Discovery Summary:** [PAPER_DISCOVERY_SUMMARY.md](../../test_outputs/PAPER_DISCOVERY_SUMMARY.md)
- **Test Reports:** `test_outputs/` directory
- **API Reference:** [TEST_ENVIRONMENT_GUIDE.md](../../docs/guides/TEST_ENVIRONMENT_GUIDE.md)

---

**Track your rewards and maximize your contributions to the Awarenessverse!**

