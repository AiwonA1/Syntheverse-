/**
 * Get detailed summary of all discoveries including scores, epochs, and rewards
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployment addresses
  const deploymentFile = path.join(__dirname, "../deployments/deployment-localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  // Get contract instances
  const pod = await ethers.getContractAt(
    "ProofOfDiscovery",
    deployment.contracts.ProofOfDiscovery
  );

  const token = await ethers.getContractAt(
    "SyntheverseToken",
    deployment.contracts.SyntheverseToken
  );

  // Get discovery count
  const discoveryCount = await pod.getDiscoveryCount();
  console.log(`\nTotal Discoveries: ${discoveryCount}\n`);

  // Get all discovery IDs
  const allDiscoveryIds = await pod.getDiscoveryIds(0, Number(discoveryCount));
  
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  const summaries = [];

  console.log("=".repeat(80));
  console.log("DISCOVERY SUMMARY REPORT");
  console.log("=".repeat(80));
  console.log();

  for (let i = 0; i < allDiscoveryIds.length; i++) {
    const discoveryId = allDiscoveryIds[i];
    const discovery = await pod.getDiscovery(discoveryId);
    
    // Calculate PoD Score
    const podScore = (discovery.coherenceScore * discovery.densityScore * discovery.noveltyScore) / (10000n * 10000n);
    
    // Determine epoch
    const qualifiedEpoch = await pod.getQualifiedEpoch(discovery.densityScore);
    const epochName = epochNames[Number(qualifiedEpoch)];
    
    // Get discoverer balance (approximate reward)
    const balance = await token.balanceOf(discovery.discoverer);
    
    // Check if content is redundant
    const isRedundant = discovery.redundant;
    const contentHash = discovery.contentHash;
    
    summaries.push({
      index: i + 1,
      discoveryId: discoveryId,
      discoverer: discovery.discoverer,
      contentHash: contentHash,
      validated: discovery.validated,
      redundant: isRedundant,
      coherenceScore: Number(discovery.coherenceScore),
      densityScore: Number(discovery.densityScore),
      noveltyScore: Number(discovery.noveltyScore),
      podScore: Number(podScore),
      qualifiedEpoch: epochName,
      tokenReward: ethers.formatEther(balance),
      timestamp: new Date(Number(discovery.timestamp) * 1000).toISOString()
    });

    console.log(`Discovery #${i + 1}`);
    console.log(`  ID: ${discoveryId}`);
    console.log(`  Discoverer: ${discovery.discoverer}`);
    console.log(`  Content Hash: ${contentHash}`);
    console.log(`  Validated: ${discovery.validated}`);
    console.log(`  Redundant: ${isRedundant}`);
    console.log(`  Scores:`);
    console.log(`    Coherence: ${discovery.coherenceScore}`);
    console.log(`    Density: ${discovery.densityScore}`);
    console.log(`    Novelty: ${discovery.noveltyScore}`);
    console.log(`  PoD Score: ${podScore}`);
    console.log(`  Qualified Epoch: ${epochName}`);
    console.log(`  Token Reward: ${ethers.formatEther(balance)} SYNTH`);
    console.log(`  Timestamp: ${new Date(Number(discovery.timestamp) * 1000).toISOString()}`);
    console.log();
  }

  // Summary statistics
  console.log("=".repeat(80));
  console.log("SUMMARY STATISTICS");
  console.log("=".repeat(80));
  
  const validated = summaries.filter(s => s.validated).length;
  const redundant = summaries.filter(s => s.redundant).length;
  const avgCoherence = summaries.reduce((sum, s) => sum + s.coherenceScore, 0) / summaries.length;
  const avgDensity = summaries.reduce((sum, s) => sum + s.densityScore, 0) / summaries.length;
  const avgNovelty = summaries.reduce((sum, s) => sum + s.noveltyScore, 0) / summaries.length;
  const avgPoD = summaries.reduce((sum, s) => sum + s.podScore, 0) / summaries.length;
  
  const epochDistribution = {};
  summaries.forEach(s => {
    epochDistribution[s.qualifiedEpoch] = (epochDistribution[s.qualifiedEpoch] || 0) + 1;
  });

  console.log(`Total Discoveries: ${summaries.length}`);
  console.log(`Validated: ${validated}`);
  console.log(`Redundant: ${redundant}`);
  console.log(`Average Scores:`);
  console.log(`  Coherence: ${avgCoherence.toFixed(2)}`);
  console.log(`  Density: ${avgDensity.toFixed(2)}`);
  console.log(`  Novelty: ${avgNovelty.toFixed(2)}`);
  console.log(`  PoD Score: ${avgPoD.toFixed(2)}`);
  console.log(`Epoch Distribution:`);
  Object.entries(epochDistribution).forEach(([epoch, count]) => {
    console.log(`  ${epoch}: ${count}`);
  });
  
  // Total coherence density
  const totalDensity = await pod.totalCoherenceDensity();
  console.log(`Total Coherence Density: ${totalDensity}`);
  
  // Current epoch
  const currentEpoch = await token.currentEpoch();
  console.log(`Current Epoch: ${epochNames[Number(currentEpoch)]}`);
  
  console.log();
  console.log("=".repeat(80));
  
  // Save detailed summary to JSON
  const summaryFile = path.join(__dirname, "../../test_outputs/discovery_summary.json");
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalDiscoveries: summaries.length,
    statistics: {
      validated,
      redundant,
      avgCoherence,
      avgDensity,
      avgNovelty,
      avgPoD,
      epochDistribution,
      totalCoherenceDensity: totalDensity.toString(),
      currentEpoch: epochNames[Number(currentEpoch)]
    },
    discoveries: summaries
  }, null, 2));
  
  console.log(`\nDetailed summary saved to: ${summaryFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

