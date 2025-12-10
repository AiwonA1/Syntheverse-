/**
 * Example script demonstrating Syntheverse blockchain usage
 * Run with: npx hardhat run scripts/example_usage.js --network localhost
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Syntheverse Blockchain Example ===\n");

  const [deployer, discoverer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Discoverer:", discoverer.address);
  console.log("");

  // Load deployment addresses
  const deploymentFile = path.join(
    __dirname,
    "../deployments/deployment-localhost.json"
  );

  let deployment;
  try {
    deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("Loaded deployment addresses from:", deploymentFile);
  } catch (error) {
    console.error("Error: Deployment file not found. Please run 'npm run deploy:local' first.");
    process.exit(1);
  }

  // Get contract instances
  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );

  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );

  const aiIntegration = await ethers.getContractAt(
    "AIIntegration",
    deployment.contracts.AIIntegration
  );

  console.log("Token address:", await token.getAddress());
  console.log("PoD address:", await pod.getAddress());
  console.log("AI Integration address:", await aiIntegration.getAddress());
  console.log("");

  // Check current epoch
  const epoch = await token.currentEpoch();
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  console.log("Current epoch:", epochNames[epoch]);
  console.log("");

  // Example 1: Submit a discovery
  console.log("=== Example 1: Submitting a Discovery ===");
  const content = "A novel insight about hydrogen-holographic fractal structures in neural networks";
  const fractalData = "Fractal embedding: coherence=0.85, density=0.72, novelty=0.91";

  const contentHash = ethers.id(content);
  const fractalHash = ethers.id(fractalData);

  console.log("Content:", content);
  console.log("Content Hash:", contentHash);
  console.log("Fractal Hash:", fractalHash);
  console.log("");

  console.log("Submitting discovery...");
  const submitTx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
  const submitReceipt = await submitTx.wait();

  // Extract discovery ID from event
  const submitEvent = submitReceipt.logs.find(log => {
    try {
      const parsed = pod.interface.parseLog(log);
      return parsed && parsed.name === "DiscoverySubmitted";
    } catch {
      return false;
    }
  });

  if (!submitEvent) {
    console.error("Could not find DiscoverySubmitted event");
    return;
  }

  const discoveryId = submitEvent.args[0];
  console.log("✓ Discovery submitted!");
  console.log("Discovery ID:", discoveryId);
  console.log("");

  // Example 2: Validate the discovery
  console.log("=== Example 2: Validating Discovery ===");
  const coherenceScore = 850;  // 0-10000 scale
  const densityScore = 720;
  const noveltyScore = 910;

  console.log("Validation scores:");
  console.log("  Coherence:", coherenceScore);
  console.log("  Density:", densityScore);
  console.log("  Novelty:", noveltyScore);
  console.log("");

  console.log("Validating discovery...");
  const validateTx = await pod.validateDiscovery(
    discoveryId,
    coherenceScore,
    densityScore,
    noveltyScore
  );
  await validateTx.wait();
  console.log("✓ Discovery validated!");
  console.log("");

  // Check discovery status
  const discovery = await pod.getDiscovery(discoveryId);
  console.log("Discovery Details:");
  console.log("  Validated:", discovery.validated);
  console.log("  Coherence Score:", discovery.coherenceScore.toString());
  console.log("  Density Score:", discovery.densityScore.toString());
  console.log("  Novelty Score:", discovery.noveltyScore.toString());
  console.log("  Discoverer:", discovery.discoverer);
  console.log("");

  // Check token balance
  const balance = await token.balanceOf(discoverer.address);
  console.log("Discoverer token balance:", ethers.formatEther(balance), "SYNTH");
  console.log("");

  // Example 3: Check coherence density
  console.log("=== Example 3: Coherence Density ===");
  const totalDensity = await pod.totalCoherenceDensity();
  console.log("Total Coherence Density:", totalDensity.toString());
  
  const tokenDensity = await token.coherenceDensity();
  console.log("Token Coherence Density:", tokenDensity.toString());
  console.log("");

  // Example 4: Check epoch progression
  console.log("=== Example 4: Epoch Status ===");
  const currentEpoch = await token.currentEpoch();
  const threshold = await token.coherenceDensityThreshold();
  console.log("Current Epoch:", epochNames[currentEpoch]);
  console.log("Coherence Density Threshold:", threshold.toString());
  console.log("Current Density:", tokenDensity.toString());
  
  if (tokenDensity >= threshold && currentEpoch < 3) {
    console.log("⚠ Epoch can be advanced!");
  } else {
    console.log("Epoch progression:", 
      ((Number(tokenDensity) / Number(threshold)) * 100).toFixed(2) + "%");
  }
  console.log("");

  // Example 5: Get discovery count
  console.log("=== Example 5: Statistics ===");
  const discoveryCount = await pod.getDiscoveryCount();
  console.log("Total Discoveries:", discoveryCount.toString());
  console.log("");

  console.log("=== Example Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




