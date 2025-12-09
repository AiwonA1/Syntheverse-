/**
 * Verification script to check if Syntheverse setup is correct
 * Run with: node verify_setup.js
 */

const fs = require("fs");
const path = require("path");

console.log("=== Syntheverse Setup Verification ===\n");

let allGood = true;

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.log("❌ Node.js 18+ required. Current:", nodeVersion);
  allGood = false;
} else {
  console.log("✓ Node.js version:", nodeVersion);
}

// Check if node_modules exists
if (!fs.existsSync("node_modules")) {
  console.log("❌ node_modules not found. Run: npm install");
  allGood = false;
} else {
  console.log("✓ Dependencies installed");
}

// Check if Hardhat is installed
try {
  require.resolve("@nomicfoundation/hardhat-toolbox");
  console.log("✓ Hardhat toolbox installed");
} catch (e) {
  console.log("❌ Hardhat toolbox not found. Run: npm install");
  allGood = false;
}

// Check if contracts are compiled
const artifactsDir = path.join("blockchain", "artifacts");
if (!fs.existsSync(artifactsDir)) {
  console.log("⚠ Contracts not compiled. Run: npm run compile");
} else {
  console.log("✓ Contracts compiled (or compilation artifacts exist)");
}

// Check if deployment file exists (optional)
const deploymentFile = path.join("blockchain", "deployments", "deployment-localhost.json");
if (!fs.existsSync(deploymentFile)) {
  console.log("ℹ Deployment file not found (run 'npm run deploy:local' after starting node)");
} else {
  console.log("✓ Deployment file exists");
}

// Check project structure
const requiredDirs = [
  "blockchain/smart_contracts",
  "blockchain/scripts",
  "blockchain/tests",
  "hhf-ai/integration"
];

console.log("\nChecking project structure:");
for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log("✓", dir);
  } else {
    console.log("⚠", dir, "(missing)");
  }
}

// Check key files
const requiredFiles = [
  "package.json",
  "hardhat.config.js",
  "blockchain/smart_contracts/SyntheverseToken.sol",
  "blockchain/smart_contracts/ProofOfDiscovery.sol",
  "blockchain/smart_contracts/AIIntegration.sol"
];

console.log("\nChecking key files:");
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log("✓", file);
  } else {
    console.log("❌", file, "(missing)");
    allGood = false;
  }
}

console.log("\n=== Verification Complete ===");
if (allGood) {
  console.log("✓ Setup looks good! You're ready to start.");
  console.log("\nNext steps:");
  console.log("1. npm run node (start local blockchain)");
  console.log("2. npm run deploy:local (deploy contracts)");
  console.log("3. npm run test (run tests)");
} else {
  console.log("⚠ Some issues found. Please fix them before proceeding.");
  process.exit(1);
}


