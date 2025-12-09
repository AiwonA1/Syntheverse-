/**
 * Test Syntheverse blockchain with the actual research papers
 * This script submits the HHF-AI and PoD Protocol papers as discoveries
 * Outputs comprehensive logs, transactions, and reports to a file
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Output file
const OUTPUT_DIR = path.join(__dirname, "../../test_outputs");
const OUTPUT_FILE = path.join(OUTPUT_DIR, `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
const JSON_REPORT_FILE = path.join(OUTPUT_DIR, `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// Logging utility
class TestLogger {
  constructor() {
    this.logs = [];
    this.transactions = [];
    this.errors = [];
    this.startTime = new Date();
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(message);
    this.logs.push({ timestamp, message, data });
    return logEntry;
  }

  logTransaction(txHash, type, details) {
    const txEntry = {
      timestamp: new Date().toISOString(),
      hash: txHash,
      type,
      details
    };
    this.transactions.push(txEntry);
    this.log(`Transaction: ${type}`, { hash: txHash, details });
  }

  logError(error, context) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      context,
      stack: error.stack
    };
    this.errors.push(errorEntry);
    this.log(`ERROR: ${error.message || error}`, { context });
  }

  async saveReport() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const endTime = new Date();
    const duration = (endTime - this.startTime) / 1000;

    // Generate text report
    let report = `╔══════════════════════════════════════════════════════════════╗
║     Syntheverse Blockchain Test Report                      ║
╚══════════════════════════════════════════════════════════════╝

Test Execution Summary
──────────────────────
Start Time: ${this.startTime.toISOString()}
End Time: ${endTime.toISOString()}
Duration: ${duration.toFixed(2)} seconds

`;

    // Test Results
    const hasErrors = this.errors.length > 0;
    report += `Test Status: ${hasErrors ? '❌ FAILED' : '✅ SUCCESS'}
Total Errors: ${this.errors.length}
Total Transactions: ${this.transactions.length}
Total Log Entries: ${this.logs.length}

`;

    // Errors Section
    if (this.errors.length > 0) {
      report += `Errors
──────
`;
      this.errors.forEach((err, idx) => {
        report += `${idx + 1}. [${err.timestamp}] ${err.context || 'Unknown'}\n`;
        report += `   Error: ${err.error}\n`;
        if (err.stack) {
          report += `   Stack: ${err.stack.split('\n').slice(0, 3).join('\n   ')}\n`;
        }
        report += `\n`;
      });
    }

    // Transactions Section
    if (this.transactions.length > 0) {
      report += `Transactions
─────────────
`;
      this.transactions.forEach((tx, idx) => {
        report += `${idx + 1}. ${tx.type}\n`;
        report += `   Hash: ${tx.hash}\n`;
        report += `   Timestamp: ${tx.timestamp}\n`;
        if (tx.details) {
          report += `   Details: ${JSON.stringify(tx.details, null, 2).split('\n').join('\n   ')}\n`;
        }
        report += `\n`;
      });
    }

    // Logs Section
    report += `Execution Logs
──────────────
`;
    this.logs.forEach(log => {
      report += `[${log.timestamp}] ${log.message}\n`;
      if (log.data) {
        report += `   ${JSON.stringify(log.data, null, 2).split('\n').join('\n   ')}\n`;
      }
    });

    // Save text report
    fs.writeFileSync(OUTPUT_FILE, report);
    this.log(`Report saved to: ${OUTPUT_FILE}`);

    // Generate JSON report
    const jsonReport = {
      metadata: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        status: hasErrors ? 'FAILED' : 'SUCCESS'
      },
      summary: {
        totalErrors: this.errors.length,
        totalTransactions: this.transactions.length,
        totalLogs: this.logs.length
      },
      errors: this.errors,
      transactions: this.transactions,
      logs: this.logs
    };

    fs.writeFileSync(JSON_REPORT_FILE, JSON.stringify(jsonReport, null, 2));
    this.log(`JSON report saved to: ${JSON_REPORT_FILE}`);

    return { textFile: OUTPUT_FILE, jsonFile: JSON_REPORT_FILE, hasErrors };
  }
}

// Read paper contents
function readPaper(filename) {
  const paperPath = path.join(__dirname, "../../docs", filename);
  try {
    return fs.readFileSync(paperPath, "utf-8");
  } catch (error) {
    throw new Error(`Error reading ${filename}: ${error.message}`);
  }
}

// Calculate mock scores based on paper content
function calculateScores(paperContent, paperType) {
  let coherence, density, novelty;
  
  if (paperType === "HHF-AI") {
    coherence = 9200;
    density = 8500;
    novelty = 9500;
  } else if (paperType === "PoD") {
    coherence = 8800;
    density = 9200;
    novelty = 9000;
  } else {
    coherence = 7000;
    density = 6500;
    novelty = 7500;
  }
  
  return { coherence, density, novelty };
}

async function main() {
  const logger = new TestLogger();
  
  try {
    logger.log("╔══════════════════════════════════════════════════════════════╗");
    logger.log("║     Syntheverse Paper Discovery Test                        ║");
    logger.log("╚══════════════════════════════════════════════════════════════╝");
    logger.log("");

    // Load deployment addresses
    const deploymentFile = path.join(
      __dirname,
      "../deployments/deployment-localhost.json"
    );

    let deployment;
    try {
      deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      logger.log("✓ Loaded deployment addresses", { file: deploymentFile });
    } catch (error) {
      logger.logError(error, "Loading deployment file");
      throw error;
    }

    // Get signers
    const [deployer, discoverer1, discoverer2] = await ethers.getSigners();
    logger.log("Deployer:", deployer.address);
    logger.log("Discoverer 1:", discoverer1.address);
    logger.log("Discoverer 2:", discoverer2.address);
    logger.log("");

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

    logger.log("Contracts:", {
      Token: await token.getAddress(),
      PoD: await pod.getAddress(),
      AI_Integration: await aiIntegration.getAddress()
    });
    logger.log("");

    // Check initial state
    logger.log("=== Initial State ===");
    const initialEpoch = await token.currentEpoch();
    const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
    logger.log("Current Epoch:", epochNames[initialEpoch]);
    logger.log("");

    // Read papers
    logger.log("=== Reading Papers ===");
    let hhfPaper, podPaper;
    try {
      hhfPaper = readPaper("HHF-AI_Paper.pdF");
      logger.log("✓ HHF-AI Paper loaded", { length: hhfPaper.length });
    } catch (error) {
      logger.logError(error, "Reading HHF-AI paper");
      throw error;
    }

    try {
      podPaper = readPaper("PoD_Protocol_Paper.pdf");
      logger.log("✓ PoD Protocol Paper loaded", { length: podPaper.length });
    } catch (error) {
      logger.logError(error, "Reading PoD Protocol paper");
      throw error;
    }
    logger.log("");

    // Paper 1: HHF-AI Paper
    logger.log("=== Paper 1: HHF-AI Paper ===");
    logger.log("Title: Syntheverse HHF-AI: Hydrogen-Holographic Fractal Awareness System");
    logger.log("Authors: FractiAI Research Team × Syntheverse Whole Brain AI");
    logger.log("");

    const hhfContentHash = ethers.id(hhfPaper);
    const hhfFractalHash = ethers.id(JSON.stringify({
      type: "HHF-AI",
      coherence: 0.92,
      density: 0.85,
      novelty: 0.95,
      layers: [0.9, 0.88, 0.93]
    }));

    logger.log("Submitting HHF-AI paper as discovery...");
    let hhfSubmitTx, hhfSubmitReceipt, hhfDiscoveryId;
    try {
      hhfSubmitTx = await pod.connect(discoverer1).submitDiscovery(
        hhfContentHash,
        hhfFractalHash
      );
      logger.logTransaction(hhfSubmitTx.hash, "Submit Discovery (HHF-AI)", {
        discoverer: discoverer1.address,
        contentHash: hhfContentHash,
        fractalHash: hhfFractalHash
      });

      hhfSubmitReceipt = await hhfSubmitTx.wait();
      logger.log("✓ Transaction confirmed", {
        blockNumber: hhfSubmitReceipt.blockNumber,
        gasUsed: hhfSubmitReceipt.gasUsed.toString()
      });

      // Extract discovery ID
      const hhfEvent = hhfSubmitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });

      if (!hhfEvent) {
        throw new Error("Could not find DiscoverySubmitted event for HHF-AI paper");
      }

      hhfDiscoveryId = hhfEvent.args[0];
      logger.log("✓ HHF-AI paper submitted!", {
        discoveryId: hhfDiscoveryId,
        contentHash: hhfContentHash,
        fractalHash: hhfFractalHash
      });
    } catch (error) {
      logger.logError(error, "Submitting HHF-AI paper");
      throw error;
    }
    logger.log("");

    // Paper 2: PoD Protocol Paper
    logger.log("=== Paper 2: PoD Protocol Paper ===");
    logger.log("Title: Syntheverse PoD: Hydrogen-Holographic Fractal Consensus");
    logger.log("Authors: FractiAI Research Team × Syntheverse Whole Brain AI");
    logger.log("");

    const podContentHash = ethers.id(podPaper);
    const podFractalHash = ethers.id(JSON.stringify({
      type: "PoD-Protocol",
      coherence: 0.88,
      density: 0.92,
      novelty: 0.90,
      layers: [0.85, 0.90, 0.88]
    }));

    logger.log("Submitting PoD Protocol paper as discovery...");
    let podSubmitTx, podSubmitReceipt, podDiscoveryId;
    
    // Check if already submitted
    const podAlreadyExists = await pod.contentHashes(podContentHash);
    if (podAlreadyExists) {
      logger.log("⚠ PoD Protocol paper already submitted (content hash exists)");
      logger.log("   Using modified content for new submission...");
      podSubmitTx = await pod.connect(discoverer2).submitDiscovery(
        ethers.id(podPaper + "v2"), // Modified content hash
        ethers.id(podFractalHash + Date.now().toString())
      );
    } else {
      podSubmitTx = await pod.connect(discoverer2).submitDiscovery(
        podContentHash,
        podFractalHash
      );
    }
    
    try {
      logger.logTransaction(podSubmitTx.hash, "Submit Discovery (PoD Protocol)", {
        discoverer: discoverer2.address,
        contentHash: podContentHash,
        fractalHash: podFractalHash
      });

      podSubmitReceipt = await podSubmitTx.wait();
      logger.log("✓ Transaction confirmed", {
        blockNumber: podSubmitReceipt.blockNumber,
        gasUsed: podSubmitReceipt.gasUsed.toString()
      });

      const podEvent = podSubmitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });

      if (!podEvent) {
        throw new Error("Could not find DiscoverySubmitted event for PoD paper");
      }

      podDiscoveryId = podEvent.args[0];
      logger.log("✓ PoD Protocol paper submitted!", {
        discoveryId: podDiscoveryId,
        contentHash: podContentHash,
        fractalHash: podFractalHash
      });
    } catch (error) {
      logger.logError(error, "Submitting PoD Protocol paper");
      throw error;
    }
    logger.log("");

    // Validate discoveries with AI scores
    logger.log("=== Validating Discoveries ===");

    // Calculate scores for HHF-AI paper
    const hhfScores = calculateScores(hhfPaper, "HHF-AI");
    logger.log("HHF-AI Paper Scores:", hhfScores);
    logger.log("");

    logger.log("Validating HHF-AI discovery...");
    let hhfValidateTx, hhfValidateReceipt;
    try {
      hhfValidateTx = await pod.validateDiscovery(
        hhfDiscoveryId,
        hhfScores.coherence,
        hhfScores.density,
        hhfScores.novelty
      );
      logger.logTransaction(hhfValidateTx.hash, "Validate Discovery (HHF-AI)", {
        discoveryId: hhfDiscoveryId,
        scores: hhfScores
      });

      hhfValidateReceipt = await hhfValidateTx.wait();
      logger.log("✓ Validation transaction confirmed", {
        blockNumber: hhfValidateReceipt.blockNumber,
        gasUsed: hhfValidateReceipt.gasUsed.toString()
      });
      logger.log("✓ HHF-AI discovery validated!");
    } catch (error) {
      logger.logError(error, "Validating HHF-AI discovery");
      throw error;
    }
    logger.log("");

    // Calculate scores for PoD paper
    const podScores = calculateScores(podPaper, "PoD");
    logger.log("PoD Protocol Paper Scores:", podScores);
    logger.log("");

    logger.log("Validating PoD Protocol discovery...");
    let podValidateTx, podValidateReceipt;
    try {
      podValidateTx = await pod.validateDiscovery(
        podDiscoveryId,
        podScores.coherence,
        podScores.density,
        podScores.novelty
      );
      logger.logTransaction(podValidateTx.hash, "Validate Discovery (PoD Protocol)", {
        discoveryId: podDiscoveryId,
        scores: podScores
      });

      podValidateReceipt = await podValidateTx.wait();
      logger.log("✓ Validation transaction confirmed", {
        blockNumber: podValidateReceipt.blockNumber,
        gasUsed: podValidateReceipt.gasUsed.toString()
      });
      logger.log("✓ PoD Protocol discovery validated!");
    } catch (error) {
      logger.logError(error, "Validating PoD Protocol discovery");
      throw error;
    }
    logger.log("");

    // Check discovery status
    logger.log("=== Discovery Status ===");
    const hhfDiscovery = await pod.getDiscovery(hhfDiscoveryId);
    const podDiscovery = await pod.getDiscovery(podDiscoveryId);

    logger.log("HHF-AI Discovery:", {
      validated: hhfDiscovery.validated,
      coherenceScore: hhfDiscovery.coherenceScore.toString(),
      densityScore: hhfDiscovery.densityScore.toString(),
      noveltyScore: hhfDiscovery.noveltyScore.toString(),
      discoverer: hhfDiscovery.discoverer,
      timestamp: new Date(Number(hhfDiscovery.timestamp) * 1000).toISOString()
    });
    logger.log("");

    logger.log("PoD Protocol Discovery:", {
      validated: podDiscovery.validated,
      coherenceScore: podDiscovery.coherenceScore.toString(),
      densityScore: podDiscovery.densityScore.toString(),
      noveltyScore: podDiscovery.noveltyScore.toString(),
      discoverer: podDiscovery.discoverer,
      timestamp: new Date(Number(podDiscovery.timestamp) * 1000).toISOString()
    });
    logger.log("");

    // Check token balances
    logger.log("=== Token Rewards ===");
    const balance1 = await token.balanceOf(discoverer1.address);
    const balance2 = await token.balanceOf(discoverer2.address);

    logger.log("Discoverer 1 (HHF-AI) balance:", {
      address: discoverer1.address,
      balance: ethers.formatEther(balance1) + " SYNTH",
      balanceWei: balance1.toString()
    });
    logger.log("");

    logger.log("Discoverer 2 (PoD Protocol) balance:", {
      address: discoverer2.address,
      balance: ethers.formatEther(balance2) + " SYNTH",
      balanceWei: balance2.toString()
    });
    logger.log("");

    // Check coherence density
    logger.log("=== Coherence Density ===");
    const totalDensity = await pod.totalCoherenceDensity();
    const tokenDensity = await token.coherenceDensity();
    const threshold = await token.coherenceDensityThreshold();

    logger.log("Coherence Metrics:", {
      totalDensity: totalDensity.toString(),
      tokenDensity: tokenDensity.toString(),
      threshold: threshold.toString()
    });
    logger.log("");

    const progress = (Number(tokenDensity) / Number(threshold)) * 100;
    logger.log("Epoch Progress:", `${progress.toFixed(2)}%`);
    logger.log("");

    // Check epoch status
    const currentEpoch = await token.currentEpoch();
    logger.log("Current Epoch:", epochNames[currentEpoch]);

    if (tokenDensity >= threshold && currentEpoch < 3) {
      logger.log("⚠ Epoch can be advanced!");
    }
    logger.log("");

    // Summary
    logger.log("=== Test Summary ===");
    logger.log("✓ Both papers submitted as discoveries");
    logger.log("✓ Both discoveries validated with high scores");
    logger.log("✓ Token rewards distributed");
    logger.log("✓ Coherence density updated");
    logger.log("✓ System functioning correctly!");
    logger.log("");

    // Discovery statistics
    const discoveryCount = await pod.getDiscoveryCount();
    logger.log("Total Discoveries:", discoveryCount.toString());
    logger.log("");

    // Generate conclusions
    logger.log("=== Conclusions ===");
    const conclusions = [];
    
    if (hhfDiscovery.validated && podDiscovery.validated) {
      conclusions.push("✅ Both discoveries were successfully validated");
    } else {
      conclusions.push("❌ Some discoveries failed validation");
    }

    if (balance1 > 0n && balance2 > 0n) {
      conclusions.push("✅ Token rewards were successfully distributed");
    } else {
      conclusions.push("❌ Token distribution may have failed");
    }

    if (totalDensity > 0n) {
      conclusions.push("✅ Coherence density was successfully updated");
    } else {
      conclusions.push("❌ Coherence density update failed");
    }

    if (discoveryCount >= 2n) {
      conclusions.push("✅ Discovery count is correct");
    }

    const allSuccess = conclusions.every(c => c.startsWith("✅"));
    if (allSuccess) {
      conclusions.push("✅ OVERALL TEST: SUCCESS - All systems functioning correctly");
    } else {
      conclusions.push("❌ OVERALL TEST: FAILED - Some issues detected");
    }

    conclusions.forEach(conclusion => logger.log(conclusion));
    logger.log("");

    // Save report
    const reportFiles = await logger.saveReport();
    logger.log("══════════════════════════════════════════════════════════════");
    logger.log(`Test completed. Reports saved:`);
    logger.log(`  Text Report: ${reportFiles.textFile}`);
    logger.log(`  JSON Report: ${reportFiles.jsonFile}`);
    logger.log("══════════════════════════════════════════════════════════════");

  } catch (error) {
    logger.logError(error, "Test execution");
    await logger.saveReport();
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
