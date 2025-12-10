/**
 * Check if blockchain state persists between sessions
 * This script queries the current state and saves it for comparison
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(80));
  console.log("PERSISTENCE CHECK");
  console.log("=".repeat(80));
  console.log();

  // Load deployment addresses
  const deploymentFile = path.join(__dirname, "../deployments/deployment-localhost.json");
  
  if (!fs.existsSync(deploymentFile)) {
    console.log("❌ No deployment file found. Contracts may not be deployed.");
    console.log("   Run: npm run deploy:local");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("✓ Loaded deployment addresses");
  console.log();

  // Get contract instances
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );

  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );

  // Get current state
  const discoveryCount = await pod.getDiscoveryCount();
  const totalDensity = await pod.totalCoherenceDensity();
  const currentEpoch = await token.currentEpoch();
  const tokenDensity = await token.coherenceDensity();

  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];

  console.log("Current Blockchain State:");
  console.log(`  Total Discoveries: ${discoveryCount}`);
  console.log(`  Total Coherence Density: ${totalDensity}`);
  console.log(`  Token Coherence Density: ${tokenDensity}`);
  console.log(`  Current Epoch: ${epochNames[Number(currentEpoch)]}`);
  console.log();

  // Get a few discovery IDs to verify later
  const sampleIds = await pod.getDiscoveryIds(0, Math.min(5, Number(discoveryCount)));
  
  console.log("Sample Discovery IDs (first 5):");
  sampleIds.forEach((id, idx) => {
    console.log(`  ${idx + 1}. ${id}`);
  });
  console.log();

  // Save state snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    discoveryCount: discoveryCount.toString(),
    totalDensity: totalDensity.toString(),
    tokenDensity: tokenDensity.toString(),
    currentEpoch: Number(currentEpoch),
    epochName: epochNames[Number(currentEpoch)],
    sampleDiscoveryIds: sampleIds,
    contractAddresses: {
      pod: deployment.contracts.ProofOfDiscovery,
      token: deployment.contracts.SyntheverseToken
    }
  };

  const snapshotFile = path.join(__dirname, "../../test_outputs/persistence_snapshot.json");
  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
  
  console.log("✓ State snapshot saved to:", snapshotFile);
  console.log();
  console.log("=".repeat(80));
  console.log("TO TEST PERSISTENCE:");
  console.log("1. Stop the blockchain node (Ctrl+C or kill process)");
  console.log("2. Restart: npm run node");
  console.log("3. Run this script again to compare states");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });


