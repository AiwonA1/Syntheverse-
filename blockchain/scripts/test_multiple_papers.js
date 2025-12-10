/**
 * Test Syntheverse blockchain with multiple research papers
 * This script submits multiple papers as discoveries including:
 * - HHF-AI Paper
 * - PoD Protocol Paper
 * - HHF Validation Suite
 * Outputs comprehensive logs, transactions, and reports
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Output file
const OUTPUT_DIR = path.join(__dirname, "../../test_outputs");
const OUTPUT_FILE = path.join(OUTPUT_DIR, `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
const JSON_REPORT_FILE = path.join(OUTPUT_DIR, `test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

// Paper configurations
const PAPERS = [
  {
    filename: "HHF-AI_Paper.pdF",
    title: "Syntheverse HHF-AI: Hydrogen-Holographic Fractal Awareness System",
    type: "HHF-AI",
    expectedScores: { coherence: 9200, density: 8500, novelty: 9500 }
  },
  {
    filename: "PoD_Protocol_Paper.pdf",
    title: "Syntheverse PoD: Hydrogen-Holographic Fractal Consensus",
    type: "PoD",
    expectedScores: { coherence: 8800, density: 9200, novelty: 9000 }
  },
  {
    filename: "HHF_Validation_Suite.md",
    title: "HHF Validation Suite - Empirical Validation Framework",
    type: "Validation",
    expectedScores: { coherence: 8500, density: 8000, novelty: 8200 }
  },
  {
    filename: "Awarenessverse_Paper.md",
    title: "The Awarenessverse: Empirical Modeling and Predictions of Awareness as the Ultimate Energy",
    type: "Awarenessverse",
    expectedScores: { coherence: 9000, density: 8800, novelty: 9300 }
  },
  {
    filename: "Octave_Harmonics_Paper.md",
    title: "Octave Harmonics as Empirical Evidence of the Hydrogen Holographic Fractal Environment",
    type: "Octave-Harmonics",
    expectedScores: { coherence: 9100, density: 8900, novelty: 9200 }
  },
  {
    filename: "RSI_HHFS_Paper.md",
    title: "Recursive Sourced Interference (RSI) in the Hydrogen‑Holographic Fractal Sandbox (HHFS)",
    type: "RSI-HHFS",
    expectedScores: { coherence: 9300, density: 9000, novelty: 9400 }
  },
  {
    filename: "HFG_Paper.md",
    title: "The Holographic Fractal Grammar: An Operational Linguistics of Fractal Cognitive Chemistry",
    type: "HFG",
    expectedScores: { coherence: 9400, density: 9200, novelty: 9500 }
  },
  {
    filename: "FCC_Paper.md",
    title: "Introducing Fractal Cognitive Chemistry: From Fractal Awareness to Generative and AI Awareness",
    type: "FCC",
    expectedScores: { coherence: 9200, density: 9100, novelty: 9400 }
  }
];

// Logging utility
class TestLogger {
  constructor() {
    this.logs = [];
    this.transactions = [];
    this.errors = [];
    this.discoveries = [];
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

  logDiscovery(paper, discoveryId, scores, reward) {
    this.discoveries.push({
      paper: paper.title,
      filename: paper.filename,
      discoveryId,
      scores,
      reward: reward ? reward.toString() : "0"
    });
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
║     Syntheverse Multiple Papers Test Report              ║
╚══════════════════════════════════════════════════════════════╝

Test Execution Summary
──────────────────────
Start Time: ${this.startTime.toISOString()}
End Time: ${endTime.toISOString()}
Duration: ${duration.toFixed(2)} seconds
Papers Tested: ${PAPERS.length}

`;

    // Test Results
    const hasErrors = this.errors.length > 0;
    report += `Test Status: ${hasErrors ? '❌ FAILED' : '✅ SUCCESS'}
Total Errors: ${this.errors.length}
Total Transactions: ${this.transactions.length}
Total Discoveries: ${this.discoveries.length}
Total Log Entries: ${this.logs.length}

`;

    // Discoveries Summary
    if (this.discoveries.length > 0) {
      report += `Discoveries Summary
───────────────────
`;
      this.discoveries.forEach((disc, idx) => {
        report += `${idx + 1}. ${disc.paper}\n`;
        report += `   Discovery ID: ${disc.discoveryId}\n`;
        report += `   Coherence: ${disc.scores.coherence}\n`;
        report += `   Density: ${disc.scores.density}\n`;
        report += `   Novelty: ${disc.scores.novelty}\n`;
        report += `   Reward: ${disc.reward} SYNTH\n`;
        report += `\n`;
      });
    }

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
        status: hasErrors ? 'FAILED' : 'SUCCESS',
        papersTested: PAPERS.length
      },
      summary: {
        totalErrors: this.errors.length,
        totalTransactions: this.transactions.length,
        totalDiscoveries: this.discoveries.length,
        totalLogs: this.logs.length
      },
      discoveries: this.discoveries,
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
  const paperPath = path.join(__dirname, "../../docs/research", filename);
  try {
    if (filename.endsWith('.md')) {
      // Markdown file
      return fs.readFileSync(paperPath, "utf-8");
    } else if (filename.endsWith('.pdf') || filename.endsWith('.pdF')) {
      // PDF file - try to read as text (may need PDF parsing library in future)
      try {
        return fs.readFileSync(paperPath, "utf-8");
      } catch {
        // If direct read fails, return placeholder
        return `[PDF Content: ${filename}]`;
      }
    } else {
      return fs.readFileSync(paperPath, "utf-8");
    }
  } catch (error) {
    throw new Error(`Error reading ${filename}: ${error.message}`);
  }
}

// Calculate scores based on paper content and type
function calculateScores(paperContent, paperType, expectedScores) {
  // Use expected scores as base, but can be adjusted based on content analysis
  let coherence = expectedScores.coherence;
  let density = expectedScores.density;
  let novelty = expectedScores.novelty;
  
  // Adjust based on content length and keywords
  const length = paperContent.length;
  const hasFractalKeywords = /fractal|hydrogen|holographic|coherence|density/i.test(paperContent);
  const hasValidationKeywords = /validation|empirical|framework|metric|test/i.test(paperContent);
  
  if (hasFractalKeywords) {
    coherence = Math.min(10000, coherence + 200);
    density = Math.min(10000, density + 150);
  }
  
  if (hasValidationKeywords && paperType === "Validation") {
    coherence = Math.min(10000, coherence + 300);
    density = Math.min(10000, density + 200);
    novelty = Math.min(10000, novelty + 250);
  }
  
  // Adjust based on length (longer papers may have more density)
  if (length > 10000) {
    density = Math.min(10000, density + 100);
  }
  
  return { coherence, density, novelty };
}

async function processPaper(paper, pod, token, discoverer, logger, paperIndex) {
  logger.log(`=== Paper ${paperIndex + 1}: ${paper.title} ===`);
  logger.log(`Filename: ${paper.filename}`);
  logger.log("");

  // Read paper
  let paperContent;
  try {
    paperContent = readPaper(paper.filename);
    logger.log(`✓ Paper loaded`, { length: paperContent.length, filename: paper.filename });
  } catch (error) {
    logger.logError(error, `Reading ${paper.filename}`);
    return null;
  }

  // Compute hashes
  const contentHash = ethers.id(paperContent);
  const fractalHash = ethers.id(JSON.stringify({
    type: paper.type,
    filename: paper.filename,
    timestamp: Date.now(),
    layers: [0.9, 0.88, 0.93]
  }));

  // Check if already submitted
  const alreadyExists = await pod.contentHashes(contentHash);
  if (alreadyExists) {
    logger.log(`⚠ Paper already submitted (content hash exists)`);
    logger.log(`   Using modified content for new submission...`);
    // Use modified hash
    const modifiedContent = paperContent + `\n\n[Modified: ${Date.now()}]`;
    const modifiedContentHash = ethers.id(modifiedContent);
    const modifiedFractalHash = ethers.id(JSON.stringify({
      type: paper.type,
      filename: paper.filename,
      timestamp: Date.now(),
      version: 2
    }));
    
    // Submit with modified hash
    try {
      const submitTx = await pod.connect(discoverer).submitDiscovery(
        modifiedContentHash,
        modifiedFractalHash
      );
      logger.logTransaction(submitTx.hash, `Submit Discovery (${paper.title})`, {
        discoverer: discoverer.address,
        contentHash: modifiedContentHash,
        fractalHash: modifiedFractalHash
      });

      const receipt = await submitTx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error("Could not find DiscoverySubmitted event");
      }

      const discoveryId = event.args[0];
      logger.log(`✓ Paper submitted (modified)`, { discoveryId });
      
      // Calculate and validate
      const scores = calculateScores(paperContent, paper.type, paper.expectedScores);
      await validateDiscovery(discoveryId, scores, pod, token, paper, discoverer, logger);
      
      return { discoveryId, scores };
    } catch (error) {
      logger.logError(error, `Submitting ${paper.title}`);
      return null;
    }
  }

  // Submit discovery
  logger.log("Submitting paper as discovery...");
  let submitTx, submitReceipt, discoveryId;
  try {
    submitTx = await pod.connect(discoverer).submitDiscovery(
      contentHash,
      fractalHash
    );
    logger.logTransaction(submitTx.hash, `Submit Discovery (${paper.title})`, {
      discoverer: discoverer.address,
      contentHash: contentHash,
      fractalHash: fractalHash
    });

    submitReceipt = await submitTx.wait();
    logger.log("✓ Transaction confirmed", {
      blockNumber: submitReceipt.blockNumber,
      gasUsed: submitReceipt.gasUsed.toString()
    });

    const event = submitReceipt.logs.find(log => {
      try {
        const parsed = pod.interface.parseLog(log);
        return parsed && parsed.name === "DiscoverySubmitted";
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error("Could not find DiscoverySubmitted event");
    }

    discoveryId = event.args[0];
    logger.log(`✓ Paper submitted!`, {
      discoveryId: discoveryId,
      contentHash: contentHash,
      fractalHash: fractalHash
    });
  } catch (error) {
    logger.logError(error, `Submitting ${paper.title}`);
    return null;
  }
  logger.log("");

  // Calculate scores
  const scores = calculateScores(paperContent, paper.type, paper.expectedScores);
  logger.log("Calculated Scores:", scores);
  
  // Check which epoch it qualifies for
  const qualifiedEpoch = await pod.getQualifiedEpoch(scores.density);
  const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
  logger.log(`  Qualified Epoch (based on density): ${epochNames[Number(qualifiedEpoch)]}`);
  logger.log("");

  // Validate discovery
  await validateDiscovery(discoveryId, scores, pod, token, paper, discoverer, logger);

  return { discoveryId, scores };
}

async function validateDiscovery(discoveryId, scores, pod, token, paper, discoverer, logger) {
  logger.log("Validating discovery...");
  try {
    const validateTx = await pod.validateDiscovery(
      discoveryId,
      scores.coherence,
      scores.density,
      scores.novelty
    );
    logger.logTransaction(validateTx.hash, `Validate Discovery (${paper.title})`, {
      discoveryId: discoveryId,
      scores: scores
    });

    const validateReceipt = await validateTx.wait();
    logger.log("✓ Validation transaction confirmed", {
      blockNumber: validateReceipt.blockNumber,
      gasUsed: validateReceipt.gasUsed.toString()
    });

    // Check discovery status
    const discovery = await pod.getDiscovery(discoveryId);
    logger.log("✓ Discovery validated!", {
      validated: discovery.validated,
      coherenceScore: discovery.coherenceScore.toString(),
      densityScore: discovery.densityScore.toString(),
      noveltyScore: discovery.noveltyScore.toString()
    });

    // Check token balance
    const balance = await token.balanceOf(discoverer.address);
    logger.log("Token Balance:", {
      address: discoverer.address,
      balance: ethers.formatEther(balance) + " SYNTH"
    });

    // Log discovery summary
    logger.logDiscovery(paper, discoveryId, scores, balance);

    logger.log("");
    return { discovery, balance };
  } catch (error) {
    logger.logError(error, `Validating ${paper.title}`);
    throw error;
  }
}

async function main() {
  const logger = new TestLogger();
  
  try {
    logger.log("╔══════════════════════════════════════════════════════════════╗");
    logger.log("║     Syntheverse Multiple Papers Discovery Test               ║");
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
    const signers = await ethers.getSigners();
    logger.log(`Available signers: ${signers.length}`);
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

    logger.log("Contracts:", {
      Token: await token.getAddress(),
      PoD: await pod.getAddress()
    });
    logger.log("");

    // Check initial state
    logger.log("=== Initial State ===");
    const initialEpoch = await token.currentEpoch();
    const epochNames = ["Founders", "Pioneer", "Public", "Ecosystem"];
    logger.log("Current Epoch:", epochNames[Number(initialEpoch)]);
    const initialDensity = await pod.totalCoherenceDensity();
    logger.log("Initial Coherence Density:", initialDensity.toString());
    logger.log("");

    // Process each paper
    const results = [];
    for (let i = 0; i < PAPERS.length; i++) {
      const paper = PAPERS[i];
      const discoverer = signers[i % signers.length]; // Rotate through signers
      
      logger.log(`Processing paper ${i + 1} of ${PAPERS.length}...`);
      const result = await processPaper(paper, pod, token, discoverer, logger, i);
      if (result) {
        results.push(result);
      }
      logger.log("");
    }

    // Final summary
    logger.log("=== Final Summary ===");
    const finalEpoch = await token.currentEpoch();
    const finalDensity = await pod.totalCoherenceDensity();
    const discoveryCount = await pod.getDiscoveryCount();

    logger.log("Final State:", {
      epoch: epochNames[Number(finalEpoch)],
      coherenceDensity: finalDensity.toString(),
      totalDiscoveries: discoveryCount.toString()
    });
    logger.log("");

    logger.log("=== Test Summary ===");
    logger.log(`✓ Processed ${results.length} papers`);
    logger.log(`✓ Total discoveries: ${discoveryCount.toString()}`);
    logger.log(`✓ Coherence density: ${finalDensity.toString()}`);
    logger.log(`✓ Current epoch: ${epochNames[Number(finalEpoch)]}`);
    logger.log("");

    // Generate conclusions
    logger.log("=== Conclusions ===");
    const conclusions = [];
    
    if (results.length === PAPERS.length) {
      conclusions.push("✅ All papers were successfully processed");
    } else {
      conclusions.push(`⚠ Only ${results.length} of ${PAPERS.length} papers were processed`);
    }

    if (discoveryCount >= BigInt(PAPERS.length)) {
      conclusions.push("✅ Discovery count is correct");
    } else {
      conclusions.push("⚠ Discovery count may be incorrect");
    }

    if (finalDensity > initialDensity) {
      conclusions.push("✅ Coherence density was successfully updated");
    } else {
      conclusions.push("⚠ Coherence density may not have updated");
    }

    const allSuccess = conclusions.every(c => c.startsWith("✅"));
    if (allSuccess) {
      conclusions.push("✅ OVERALL TEST: SUCCESS - All systems functioning correctly");
    } else {
      conclusions.push("⚠ OVERALL TEST: PARTIAL - Some issues detected");
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

