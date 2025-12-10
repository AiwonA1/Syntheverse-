# Syntheverse AI - Usage Examples

This document provides practical examples for using the Syntheverse blockchain test environment.

## Table of Contents
1. [Basic Discovery Submission](#basic-discovery-submission)
2. [Discovery Validation](#discovery-validation)
3. [Checking Rewards](#checking-rewards)
4. [Monitoring Epochs](#monitoring-epochs)
5. [Batch Operations](#batch-operations)
6. [Python Integration](#python-integration)
7. [Event Listening](#event-listening)
8. [Error Handling](#error-handling)

---

## Basic Discovery Submission

### JavaScript/TypeScript

```javascript
const { ethers } = require("hardhat");
const fs = require("fs");

async function submitDiscovery() {
  // Load deployment info
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Prepare discovery
  const content = "My novel discovery about fractal structures";
  const fractalData = JSON.stringify({
    coherence: 0.85,
    density: 0.72,
    novelty: 0.91
  });
  
  // Compute hashes
  const contentHash = ethers.id(content);
  const fractalHash = ethers.id(fractalData);
  
  console.log("Submitting discovery...");
  console.log("Content hash:", contentHash);
  console.log("Fractal hash:", fractalHash);
  
  // Submit
  const tx = await pod.submitDiscovery(contentHash, fractalHash);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);
  
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
    console.log("✓ Discovery submitted!");
    console.log("Discovery ID:", discoveryId);
    return discoveryId;
  }
  
  throw new Error("Could not find DiscoverySubmitted event");
}

// Run
submitDiscovery()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Python

```python
from blockchain_bridge import SyntheverseBlockchainBridge
import os

# Initialize
bridge = SyntheverseBlockchainBridge(
    rpc_url="http://127.0.0.1:8545",
    private_key=os.getenv("PRIVATE_KEY")
)

# Load contracts
bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")

# Submit
content = "My novel discovery about fractal structures"
fractal_embedding = {
    "coherence": 0.85,
    "density": 0.72,
    "novelty": 0.91
}

tx_hash = bridge.submit_discovery(content, fractal_embedding)
print(f"Submitted: {tx_hash}")
```

---

## Discovery Validation

### Manual Validation

```javascript
async function validateDiscovery(discoveryId) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Validate with scores (0-10000 scale)
  const coherence = 850;   // High coherence
  const density = 720;     // Good density
  const novelty = 910;     // Very novel
  
  console.log("Validating discovery...");
  const tx = await pod.validateDiscovery(
    discoveryId,
    coherence,
    density,
    novelty
  );
  
  await tx.wait();
  console.log("✓ Discovery validated!");
  
  // Check status
  const discovery = await pod.getDiscovery(discoveryId);
  console.log("Status:", discovery.validated ? "Validated" : "Pending");
  console.log("Scores:", {
    coherence: discovery.coherenceScore.toString(),
    density: discovery.densityScore.toString(),
    novelty: discovery.noveltyScore.toString()
  });
}
```

### AI-Powered Validation

```javascript
async function validateWithAI(discoveryId) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const aiIntegration = await ethers.getContractAt(
    "AIIntegration",
    deployment.contracts.AIIntegration
  );
  
  // Request validation (triggers AI evaluation)
  await aiIntegration.requestValidation(
    discoveryId,
    contentHash,
    fractalHash,
    discovererAddress
  );
  
  // Wait for AI evaluation...
  // (In production, this would be done by the AI service)
  
  // Process validation with AI scores
  const aiScores = await evaluateWithHHFAI(discoveryId); // Your AI function
  await aiIntegration.processValidation(
    discoveryId,
    aiScores.coherence,
    aiScores.density,
    aiScores.novelty
  );
}
```

---

## Checking Rewards

```javascript
async function checkRewards(address) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  
  // Get balance
  const balance = await token.balanceOf(address);
  const formatted = ethers.formatEther(balance);
  
  console.log(`Balance for ${address}:`);
  console.log(`  ${formatted} SYNTH`);
  console.log(`  ${balance.toString()} wei`);
  
  // Get epoch info
  const epoch = await token.currentEpoch();
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  console.log(`Current epoch: ${epochNames[epoch]}`);
  
  return { balance, epoch };
}
```

---

## Monitoring Epochs

```javascript
async function monitorEpochs() {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Get current state
  const epoch = await token.currentEpoch();
  const density = await token.coherenceDensity();
  const threshold = await token.coherenceDensityThreshold();
  const totalDensity = await pod.totalCoherenceDensity();
  
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  
  console.log("=== Epoch Status ===");
  console.log(`Current Epoch: ${epochNames[epoch]}`);
  console.log(`Coherence Density: ${density.toString()}`);
  console.log(`Threshold: ${threshold.toString()}`);
  console.log(`Total Density (PoD): ${totalDensity.toString()}`);
  
  // Calculate progress
  const progress = (Number(density) / Number(threshold)) * 100;
  console.log(`Progress: ${progress.toFixed(2)}%`);
  
  // Check if can advance
  if (density >= threshold && epoch < 3) {
    console.log("⚠ Epoch can be advanced!");
  }
  
  // Get epoch reserves
  for (let i = 0; i <= 3; i++) {
    const reserve = await token.epochReserves(i);
    const distributed = await token.epochDistributed(i);
    const remaining = reserve - distributed;
    
    console.log(`\n${epochNames[i]} Epoch:`);
    console.log(`  Reserve: ${ethers.formatEther(reserve)} SYNTH`);
    console.log(`  Distributed: ${ethers.formatEther(distributed)} SYNTH`);
    console.log(`  Remaining: ${ethers.formatEther(remaining)} SYNTH`);
  }
}
```

---

## Batch Operations

### Batch Validation

```javascript
async function batchValidate() {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const aiIntegration = await ethers.getContractAt(
    "AIIntegration",
    deployment.contracts.AIIntegration
  );
  
  // Get pending requests
  const count = await aiIntegration.getPendingRequestCount();
  console.log(`Found ${count.toString()} pending requests`);
  
  if (count === 0n) {
    console.log("No pending validations");
    return;
  }
  
  // Fetch pending (limit to 10 for gas efficiency)
  const limit = count > 10n ? 10n : count;
  const pending = await aiIntegration.getPendingRequests(0, limit);
  
  console.log(`Processing ${pending.length} validations...`);
  
  // Prepare batch data
  const discoveryIds = [];
  const coherenceScores = [];
  const densityScores = [];
  const noveltyScores = [];
  
  for (const discoveryId of pending) {
    // Evaluate with AI (your function)
    const scores = await evaluateDiscovery(discoveryId);
    
    discoveryIds.push(discoveryId);
    coherenceScores.push(scores.coherence);
    densityScores.push(scores.density);
    noveltyScores.push(scores.novelty);
  }
  
  // Batch process
  const tx = await aiIntegration.batchProcessValidation(
    discoveryIds,
    coherenceScores,
    densityScores,
    noveltyScores
  );
  
  await tx.wait();
  console.log("✓ Batch validation complete!");
}
```

### Batch Discovery Submission

```javascript
async function batchSubmit(discoveries) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  const results = [];
  
  for (const discovery of discoveries) {
    try {
      const contentHash = ethers.id(discovery.content);
      const fractalHash = ethers.id(discovery.fractalData);
      
      const tx = await pod.submitDiscovery(contentHash, fractalHash);
      const receipt = await tx.wait();
      
      // Extract discovery ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        results.push({
          success: true,
          discoveryId: event.args[0],
          content: discovery.content
        });
      }
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        content: discovery.content
      });
    }
  }
  
  return results;
}

// Usage
const discoveries = [
  { content: "Discovery 1", fractalData: "data1" },
  { content: "Discovery 2", fractalData: "data2" },
  { content: "Discovery 3", fractalData: "data3" }
];

batchSubmit(discoveries).then(results => {
  console.log("Results:", results);
});
```

---

## Python Integration

### Complete Python Workflow

```python
from blockchain_bridge import SyntheverseBlockchainBridge
import os
import time

def main():
    # Initialize bridge
    bridge = SyntheverseBlockchainBridge(
        rpc_url="http://127.0.0.1:8545",
        private_key=os.getenv("PRIVATE_KEY")
    )
    
    # Load contracts
    bridge.load_contracts("./blockchain/deployments/deployment-localhost.json")
    
    # Submit discovery
    content = "Novel HHF-AI insight about recursive structures"
    fractal_embedding = {
        "coherence": 0.85,
        "density": 0.72,
        "novelty": 0.91,
        "layers": [0.8, 0.75, 0.9]
    }
    
    print("Submitting discovery...")
    tx_hash = bridge.submit_discovery(content, fractal_embedding)
    print(f"Submitted: {tx_hash}")
    
    # Wait for confirmation
    time.sleep(2)
    
    # Evaluate with HHF-AI
    print("Evaluating with HHF-AI...")
    coherence, density, novelty = bridge.evaluate_discovery(content, fractal_embedding)
    print(f"Scores: C={coherence}, D={density}, N={novelty}")
    
    # Get pending validations
    pending = bridge.get_pending_validations(limit=10)
    print(f"Pending validations: {len(pending)}")
    
    # Process validations
    for discovery_id in pending:
        # Re-evaluate (in production, use cached results)
        scores = bridge.evaluate_discovery(content, fractal_embedding)
        
        # Validate
        validation_tx = bridge.validate_discovery(
            discovery_id,
            scores[0],  # coherence
            scores[1],  # density
            scores[2]   # novelty
        )
        print(f"Validated {discovery_id}: {validation_tx}")

if __name__ == "__main__":
    main()
```

---

## Event Listening

### Real-time Event Monitoring

```javascript
async function listenToEvents() {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );
  
  console.log("Listening for events...\n");
  
  // Listen for discovery submissions
  pod.on("DiscoverySubmitted", (discoveryId, discoverer, contentHash, fractalHash) => {
    console.log("🔔 New Discovery Submitted!");
    console.log(`  ID: ${discoveryId}`);
    console.log(`  Discoverer: ${discoverer}`);
    console.log(`  Content Hash: ${contentHash}`);
    console.log(`  Fractal Hash: ${fractalHash}\n`);
  });
  
  // Listen for validations
  pod.on("DiscoveryValidated", (
    discoveryId,
    discoverer,
    coherenceScore,
    densityScore,
    noveltyScore,
    reward
  ) => {
    console.log("✅ Discovery Validated!");
    console.log(`  ID: ${discoveryId}`);
    console.log(`  Discoverer: ${discoverer}`);
    console.log(`  Scores: C=${coherenceScore}, D=${densityScore}, N=${noveltyScore}`);
    console.log(`  Reward: ${ethers.formatEther(reward)} SYNTH\n`);
  });
  
  // Listen for epoch changes
  token.on("EpochAdvanced", (from, to) => {
    const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
    console.log("📈 Epoch Advanced!");
    console.log(`  From: ${epochNames[from]}`);
    console.log(`  To: ${epochNames[to]}\n`);
  });
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log("\nStopping event listener...");
    pod.removeAllListeners();
    token.removeAllListeners();
    process.exit(0);
  });
}

// Run
listenToEvents();
```

### Query Historical Events

```javascript
async function queryHistoricalEvents() {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  // Get current block
  const currentBlock = await ethers.provider.getBlockNumber();
  const fromBlock = currentBlock - 1000; // Last 1000 blocks
  
  // Query DiscoverySubmitted events
  const filter = pod.filters.DiscoverySubmitted();
  const events = await pod.queryFilter(filter, fromBlock, currentBlock);
  
  console.log(`Found ${events.length} discoveries in last 1000 blocks:`);
  
  for (const event of events) {
    console.log(`\nDiscovery ID: ${event.args[0]}`);
    console.log(`  Discoverer: ${event.args[1]}`);
    console.log(`  Block: ${event.blockNumber}`);
    console.log(`  Transaction: ${event.transactionHash}`);
  }
}
```

---

## Error Handling

### Robust Submission with Retry

```javascript
async function submitWithRetry(content, fractalData, maxRetries = 3) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  const contentHash = ethers.id(content);
  const fractalHash = ethers.id(fractalData);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);
      
      // Check if already exists
      if (await pod.contentHashes(contentHash)) {
        throw new Error("Content already exists (redundant)");
      }
      
      // Submit
      const tx = await pod.submitDiscovery(contentHash, fractalHash);
      const receipt = await tx.wait();
      
      // Extract discovery ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        console.log("✓ Success!");
        return event.args[0];
      }
      
      throw new Error("Event not found");
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### Validation with Error Handling

```javascript
async function validateWithErrorHandling(discoveryId) {
  const deployment = JSON.parse(
    fs.readFileSync("./blockchain/deployments/deployment-localhost.json")
  );
  
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );
  
  try {
    // Check if discovery exists
    const discovery = await pod.getDiscovery(discoveryId);
    if (discovery.discoverer === ethers.ZeroAddress) {
      throw new Error("Discovery does not exist");
    }
    
    if (discovery.validated) {
      console.log("Discovery already validated");
      return;
    }
    
    // Validate
    const tx = await pod.validateDiscovery(
      discoveryId,
      800, 500, 400
    );
    
    const receipt = await tx.wait();
    
    // Check for rejection event
    const rejectionEvent = receipt.logs.find(log => {
      try {
        const parsed = pod.interface.parseLog(log);
        return parsed && parsed.name === "DiscoveryRejected";
      } catch {
        return false;
      }
    });
    
    if (rejectionEvent) {
      console.log("Discovery rejected:", rejectionEvent.args[1]);
      return;
    }
    
    console.log("✓ Discovery validated successfully");
    
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      console.error("Error: Not authorized to validate");
    } else if (error.message.includes("does not exist")) {
      console.error("Error: Discovery not found");
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}
```

---

## Advanced Patterns

### Discovery Queue Manager

```javascript
class DiscoveryQueue {
  constructor(podAddress, aiIntegrationAddress) {
    this.podAddress = podAddress;
    this.aiIntegrationAddress = aiIntegrationAddress;
    this.queue = [];
    this.processing = false;
  }
  
  async add(content, fractalData) {
    const item = {
      content,
      fractalData,
      status: 'pending',
      timestamp: Date.now()
    };
    this.queue.push(item);
    return item;
  }
  
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        
        try {
          // Submit
          item.status = 'submitting';
          const discoveryId = await this.submit(item);
          
          // Validate
          item.status = 'validating';
          await this.validate(discoveryId, item);
          
          item.status = 'completed';
          item.discoveryId = discoveryId;
          this.queue.shift();
          
        } catch (error) {
          item.status = 'failed';
          item.error = error.message;
          this.queue.shift();
        }
      }
    } finally {
      this.processing = false;
    }
  }
  
  async submit(item) {
    // Implementation
  }
  
  async validate(discoveryId, item) {
    // Implementation
  }
}
```

---

For more examples and complete API documentation, see [TEST_ENVIRONMENT_GUIDE.md](./TEST_ENVIRONMENT_GUIDE.md).



