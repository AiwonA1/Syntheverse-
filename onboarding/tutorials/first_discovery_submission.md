# First Discovery Submission

This tutorial will guide you through submitting your first discovery to the Syntheverse Proof-of-Discovery protocol.

---

## Prerequisites

- Local test environment set up (see [Local Test Environment Setup](local_test_environment_setup.md))
- Blockchain node running (`npm run node`)
- Contracts deployed (`npm run deploy:local`)

---

## Understanding Discovery Submission

### What is a Discovery?

A discovery is a knowledge contribution that:
- Contains novel, coherent, and dense information
- Is non-redundant (unique content hash)
- Can be evaluated on three dimensions:
  - **Coherence:** Structural consistency
  - **Density:** Informational richness
  - **Novelty:** Uniqueness

### The Submission Process

1. **Prepare Content** - Your discovery content
2. **Compute Hashes** - Content hash + fractal hash
3. **Submit to Blockchain** - Create discovery record
4. **AI Validation** - System evaluates scores
5. **Token Distribution** - Rewards based on PoD Score

---

## Method 1: Submit Using Example Script

### Step 1: Prepare Your Discovery

Create a file with your discovery content, or use the example:

```javascript
// example_discovery.js
const content = "Your novel discovery about hydrogen-holographic fractal structures...";
const fractalEmbedding = {
  type: "HHF-Discovery",
  coherence: 0.85,
  density: 0.72,
  novelty: 0.91
};
```

### Step 2: Use the Example Script

```bash
npx hardhat run blockchain/scripts/example_usage.js --network localhost
```

This script demonstrates:
- Computing content and fractal hashes
- Submitting discovery to blockchain
- Validating with scores
- Checking token balance

---

## Method 2: Submit Using Test Script

### Test with Research Papers

```bash
npm run test:multiple
```

This submits 8 research papers and shows the complete workflow.

### Test with Single Paper

```bash
npx hardhat run blockchain/scripts/test_with_papers.js --network localhost
```

---

## Method 3: Custom Submission Script

Create your own submission script:

```javascript
// my_discovery.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // Load deployment addresses
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract instance
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Your discovery content
  const content = "My novel discovery about...";
  const fractalData = "Fractal embedding data...";
  
  // Compute hashes
  const contentHash = ethers.id(content);
  const fractalHash = ethers.id(fractalData);
  
  // Submit discovery
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
    
    // Validate with scores (you'll need to get these from AI evaluation)
    const coherence = 8000;
    const density = 7500;
    const novelty = 8500;
    
    console.log("Validating discovery...");
    await pod.validateDiscovery(discoveryId, coherence, density, novelty);
    
    const discovery = await pod.getDiscovery(discoveryId);
    console.log("Discovery validated:", discovery.validated);
    console.log("Scores:", {
      coherence: discovery.coherenceScore.toString(),
      density: discovery.densityScore.toString(),
      novelty: discovery.noveltyScore.toString()
    });
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
npx hardhat run my_discovery.js --network localhost
```

---

## Understanding the Results

### Discovery Submission

After submission, you'll receive:
- **Discovery ID:** Unique identifier (bytes32)
- **Content Hash:** SHA-256 hash of your content
- **Fractal Hash:** Hash of fractal embedding
- **Transaction Hash:** Blockchain transaction ID

### Validation Results

After validation:
- **Coherence Score:** 0-10,000
- **Density Score:** 0-10,000
- **Novelty Score:** 0-10,000
- **PoD Score:** Calculated from the three scores
- **Qualified Epoch:** Based on density score
- **Token Reward:** Based on PoD Score

### Example Output

```
Discovery submitted! ID: 0x7431e0f5b876c73f1519e74f31b0066950c1ce457c7a8c2fb05e51b614540dae
Validating discovery...
Discovery validated: true
Scores: {
  coherence: '9200',
  density: '8950',
  novelty: '9300'
}
PoD Score: 7657 (76.57%)
Qualified Epoch: Founders
Token Reward: 22350164797.15 SYNTH
```

---

## Using HHF-AI for Evaluation

For real AI evaluation, use the HHF-AI integration:

```python
from blockchain_bridge import SyntheverseBlockchainBridge

# Initialize bridge
bridge = SyntheverseBlockchainBridge(
    rpc_url="http://127.0.0.1:8545",
    private_key=os.getenv("PRIVATE_KEY"),
    use_real_ai=True
)

# Load contracts
bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")

# Evaluate discovery
coherence, density, novelty, analysis = bridge.evaluate_discovery(
    content="Your discovery content",
    fractal_embedding={"coherence": 0.85, "density": 0.72, "novelty": 0.91}
)

print(f"Coherence: {coherence}")
print(f"Density: {density}")
print(f"Novelty: {novelty}")
print(f"Analysis: {analysis}")
```

See [HHF_AI_INTEGRATION.md](../../HHF_AI_INTEGRATION.md) for details.

---

## Redundancy Check

The system automatically checks for redundant content:

- **Content Hash:** If the same content hash exists, submission is rejected
- **Error Message:** "Content already exists (redundant)"
- **Prevention:** Ensures each discovery is unique

**Note:** The system uses SHA-256 hashing, so identical content will always produce the same hash.

---

## Best Practices

### 1. Ensure Novelty
- Review existing discoveries
- Ensure your content is meaningfully different
- Add unique insights or perspectives

### 2. Maximize Coherence
- Maintain structural consistency
- Align with HHF principles
- Use Fractal Grammar (HFG) appropriately

### 3. Increase Density
- Provide substantial information
- Include detailed analysis
- Demonstrate deep understanding

### 4. Test Locally First
- Always test in local environment
- Verify scores before mainnet
- Check redundancy before submission

---

## Troubleshooting

### "Content already exists (redundant)"
- Your content hash matches an existing discovery
- Modify your content to make it unique
- Check existing discoveries first

### "Discovery does not exist"
- Discovery ID is incorrect
- Discovery wasn't submitted successfully
- Check transaction receipt

### "Not authorized to validate"
- Only authorized validators can validate
- Use the deployer account or authorized AI validator
- Check contract authorizations

### Low Scores
- Review scoring criteria
- Improve coherence, density, or novelty
- Study high-scoring discoveries for reference

---

## Next Steps

1. ✅ Discovery submitted successfully
2. 💰 Check [Reward Tracking](reward_tracking.md) for your token balance
3. 📊 Review [PAPER_DISCOVERY_SUMMARY.md](../../test_outputs/PAPER_DISCOVERY_SUMMARY.md) for examples
4. 🚀 Submit more discoveries!

---

## Additional Resources

- **Example Scripts:** `blockchain/scripts/example_usage.js`
- **Test Scripts:** `blockchain/scripts/test_multiple_papers.js`
- **API Reference:** [TEST_ENVIRONMENT_GUIDE.md](../../docs/guides/TEST_ENVIRONMENT_GUIDE.md)
- **Discovery Summary:** [PAPER_DISCOVERY_SUMMARY.md](../../test_outputs/PAPER_DISCOVERY_SUMMARY.md)

---

**Congratulations! You've submitted your first discovery to the Syntheverse!**

