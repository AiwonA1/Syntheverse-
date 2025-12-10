const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SyntheverseToken
  console.log("\n1. Deploying SyntheverseToken...");
  const SyntheverseToken = await ethers.getContractFactory("SyntheverseToken");
  const token = await SyntheverseToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("SyntheverseToken deployed to:", tokenAddress);

  // Deploy ProofOfDiscovery
  console.log("\n2. Deploying ProofOfDiscovery...");
  const ProofOfDiscovery = await ethers.getContractFactory("ProofOfDiscovery");
  const pod = await ProofOfDiscovery.deploy(tokenAddress, deployer.address);
  await pod.waitForDeployment();
  const podAddress = await pod.getAddress();
  console.log("ProofOfDiscovery deployed to:", podAddress);

  // Deploy AIIntegration
  console.log("\n3. Deploying AIIntegration...");
  const AIIntegration = await ethers.getContractFactory("AIIntegration");
  const aiIntegration = await AIIntegration.deploy(podAddress, deployer.address);
  await aiIntegration.waitForDeployment();
  const aiIntegrationAddress = await aiIntegration.getAddress();
  console.log("AIIntegration deployed to:", aiIntegrationAddress);

  // Authorize ProofOfDiscovery to distribute tokens
  console.log("\n4. Setting up authorizations...");
  await token.authorizeDistributor(podAddress);
  console.log("Authorized ProofOfDiscovery as token distributor");

  // Set AI Integration as validator in ProofOfDiscovery
  await pod.setAIValidator(aiIntegrationAddress);
  console.log("Set AIIntegration as AI validator");

  // Authorize deployer as AI validator
  await aiIntegration.authorizeValidator(deployer.address);
  console.log("Authorized deployer as AI validator");

  console.log("\n=== Deployment Summary ===");
  console.log("SyntheverseToken:", tokenAddress);
  console.log("ProofOfDiscovery:", podAddress);
  console.log("AIIntegration:", aiIntegrationAddress);
  console.log("\nDeployment completed successfully!");

  // Save deployment addresses (for local development)
  const fs = require("fs");
  const networkInfo = await ethers.provider.getNetwork();
  const networkName = networkInfo.name === "unknown" ? "localhost" : networkInfo.name;
  
  const deploymentInfo = {
    network: networkName,
    chainId: networkInfo.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      SyntheverseToken: tokenAddress,
      ProofOfDiscovery: podAddress,
      AIIntegration: aiIntegrationAddress
    },
    timestamp: new Date().toISOString(),
    etherscan: networkName === "sepolia" ? {
      SyntheverseToken: `https://sepolia.etherscan.io/address/${tokenAddress}`,
      ProofOfDiscovery: `https://sepolia.etherscan.io/address/${podAddress}`,
      AIIntegration: `https://sepolia.etherscan.io/address/${aiIntegrationAddress}`
    } : null
  };

  const deploymentsDir = "./blockchain/deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = `${deploymentsDir}/deployment-${networkName}.json`;
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to: ${deploymentFile}`);
  
  if (networkName === "sepolia") {
    console.log("\n=== Sepolia Explorer Links ===");
    console.log("SyntheverseToken:", deploymentInfo.etherscan.SyntheverseToken);
    console.log("ProofOfDiscovery:", deploymentInfo.etherscan.ProofOfDiscovery);
    console.log("AIIntegration:", deploymentInfo.etherscan.AIIntegration);
    console.log("\n💡 Tip: Verify contracts on Etherscan using:");
    console.log("   npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


