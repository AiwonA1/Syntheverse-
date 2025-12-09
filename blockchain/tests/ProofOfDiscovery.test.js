const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Syntheverse Blockchain Tests", function () {
  let token, pod, aiIntegration;
  let owner, discoverer, validator;
  
  beforeEach(async function () {
    [owner, discoverer, validator] = await ethers.getSigners();

    // Deploy SyntheverseToken
    const SyntheverseToken = await ethers.getContractFactory("SyntheverseToken");
    token = await SyntheverseToken.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy ProofOfDiscovery
    const ProofOfDiscovery = await ethers.getContractFactory("ProofOfDiscovery");
    pod = await ProofOfDiscovery.deploy(await token.getAddress(), owner.address);
    await pod.waitForDeployment();

    // Deploy AIIntegration
    const AIIntegration = await ethers.getContractFactory("AIIntegration");
    aiIntegration = await AIIntegration.deploy(await pod.getAddress(), owner.address);
    await aiIntegration.waitForDeployment();

    // Setup authorizations
    await token.authorizeDistributor(await pod.getAddress());
    await pod.setAIValidator(await aiIntegration.getAddress());
    await aiIntegration.authorizeValidator(owner.address);
  });

  describe("SyntheverseToken", function () {
    it("Should have correct total supply", async function () {
      const totalSupply = await token.TOTAL_SUPPLY();
      expect(totalSupply).to.equal(ethers.parseEther("90000000000000")); // 90 Trillion
    });

    it("Should start in Founders epoch", async function () {
      const epoch = await token.currentEpoch();
      expect(epoch).to.equal(0); // Founders = 0
    });

    it("Should update coherence density", async function () {
      await token.updateCoherenceDensity(1500);
      const density = await token.coherenceDensity();
      expect(density).to.equal(1500);
    });

    it("Should advance epoch when threshold is met", async function () {
      await token.setCoherenceDensityThreshold(1000);
      await token.updateCoherenceDensity(1000);
      
      const epoch = await token.currentEpoch();
      expect(epoch).to.equal(1); // Pioneer = 1
    });
  });

  describe("ProofOfDiscovery", function () {
    it("Should submit a discovery", async function () {
      const contentHash = ethers.id("test content");
      const fractalHash = ethers.id("test fractal");
      
      const tx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      const receipt = await tx.wait();
      
      expect(receipt.status).to.equal(1);
    });

    it("Should reject redundant content", async function () {
      const contentHash = ethers.id("duplicate content");
      const fractalHash = ethers.id("fractal 1");
      
      await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      
      await expect(
        pod.connect(discoverer).submitDiscovery(contentHash, ethers.id("fractal 2"))
      ).to.be.revertedWith("Content already exists (redundant)");
    });

    it("Should validate a discovery with sufficient scores", async function () {
      const contentHash = ethers.id("valid discovery");
      const fractalHash = ethers.id("valid fractal");
      
      const submitTx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      const submitReceipt = await submitTx.wait();
      
      // Extract discoveryId from event
      const event = submitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const discoveryId = event.args[0];
        
        // Validate with high scores
        await pod.validateDiscovery(discoveryId, 800, 500, 400);
        
        const discovery = await pod.getDiscovery(discoveryId);
        expect(discovery.validated).to.be.true;
        expect(discovery.coherenceScore).to.equal(800);
      }
    });

    it("Should reject discovery below thresholds", async function () {
      const contentHash = ethers.id("low score discovery");
      const fractalHash = ethers.id("low fractal");
      
      const submitTx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      const submitReceipt = await submitTx.wait();
      
      const event = submitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const discoveryId = event.args[0];
        
        // Validate with low scores (below thresholds)
        await pod.validateDiscovery(discoveryId, 100, 100, 100);
        
        const discovery = await pod.getDiscovery(discoveryId);
        expect(discovery.validated).to.be.false;
        expect(discovery.redundant).to.be.true;
      }
    });
  });

  describe("AIIntegration", function () {
    it("Should request validation", async function () {
      const contentHash = ethers.id("ai test content");
      const fractalHash = ethers.id("ai test fractal");
      
      const submitTx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      const submitReceipt = await submitTx.wait();
      
      const event = submitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const discoveryId = event.args[0];
        
        await aiIntegration.requestValidation(
          discoveryId,
          contentHash,
          fractalHash,
          discoverer.address
        );
        
        const request = await aiIntegration.validationRequests(discoveryId);
        expect(request.discoverer).to.equal(discoverer.address);
      }
    });

    it("Should process validation through AI integration", async function () {
      const contentHash = ethers.id("ai processed content");
      const fractalHash = ethers.id("ai processed fractal");
      
      const submitTx = await pod.connect(discoverer).submitDiscovery(contentHash, fractalHash);
      const submitReceipt = await submitTx.wait();
      
      const event = submitReceipt.logs.find(log => {
        try {
          const parsed = pod.interface.parseLog(log);
          return parsed && parsed.name === "DiscoverySubmitted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const discoveryId = event.args[0];
        
        await aiIntegration.requestValidation(
          discoveryId,
          contentHash,
          fractalHash,
          discoverer.address
        );
        
        // Process validation with AI scores
        await aiIntegration.processValidation(discoveryId, 900, 600, 500);
        
        const discovery = await pod.getDiscovery(discoveryId);
        expect(discovery.validated).to.be.true;
      }
    });
  });
});


