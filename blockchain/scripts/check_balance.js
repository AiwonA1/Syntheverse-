const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("Checking balance for account:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  
  // Check if balance is sufficient for deployment
  const minRequired = ethers.parseEther("0.1"); // 0.1 ETH minimum
  if (balance < minRequired) {
    console.log("\n⚠️  WARNING: Balance is below recommended minimum (0.1 ETH)");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
  } else {
    console.log("\n✓ Balance is sufficient for deployment");
  }
  
  // Estimate gas price
  try {
    const feeData = await ethers.provider.getFeeData();
    console.log("\nCurrent Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
  } catch (error) {
    console.log("\nCould not fetch gas price");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


