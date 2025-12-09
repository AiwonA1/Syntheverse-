// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SyntheverseToken.sol";

/**
 * @title ProofOfDiscovery
 * @dev Layer-2 Proof-of-Discovery Protocol for Syntheverse
 * Validates non-redundancy, coherence, density, and novelty of contributions
 */
contract ProofOfDiscovery is Ownable, ReentrancyGuard {
    SyntheverseToken public token;
    
    // Discovery submission structure
    struct Discovery {
        bytes32 contentHash;      // Semantic hash of the contribution
        bytes32 fractalHash;       // Fractal embedding hash
        address discoverer;        // Address that submitted the discovery
        uint256 coherenceScore;    // Coherence score (0-10000)
        uint256 densityScore;      // Density score (structural + informational)
        uint256 noveltyScore;      // Novelty relative to existing discoveries
        uint256 timestamp;         // Block timestamp
        bool validated;            // Whether discovery has been validated
        bool redundant;           // Whether discovery is redundant
    }
    
    // Storage
    mapping(bytes32 => Discovery) public discoveries;
    mapping(bytes32 => bool) public contentHashes; // Track all content hashes for redundancy check
    bytes32[] public discoveryIds;
    
    // Coherence and density tracking
    uint256 public totalCoherenceDensity = 0;
    uint256 public discoveryCount = 0;
    
    // Validation thresholds
    uint256 public minCoherenceScore = 500;      // Minimum coherence to be valid
    uint256 public minDensityScore = 300;        // Minimum density to be valid
    uint256 public minNoveltyScore = 200;        // Minimum novelty to be valid
    
    // Epoch qualification thresholds (based on density)
    uint256 public foundersDensityThreshold = 8000;   // Density >= 8000 qualifies for Founders
    uint256 public pioneerDensityThreshold = 6000;    // Density >= 6000 qualifies for Pioneer
    uint256 public publicDensityThreshold = 4000;     // Density >= 4000 qualifies for Public
    // Density < 4000 qualifies for Ecosystem
    
    // Rewards configuration (PoD Protocol: S = Φ × ρ × (1−R) × W)
    // Reward = (PoD Score / 10000) × availableEpochBalance
    // PoD Score directly translates to percentage of available epoch tokens
    uint256 public minPoDScore = 1000;            // Minimum PoD Score to receive reward (out of 10000)
    uint256 public maxRewardPercentage = 10000;   // Maximum reward as % of epoch balance (in basis points, 10000 = 100%)
    
    // AI Integration interface (for off-chain HHF-AI validation)
    address public aiValidator;                  // Address authorized to validate discoveries
    
    // Events
    event DiscoverySubmitted(
        bytes32 indexed discoveryId,
        address indexed discoverer,
        bytes32 contentHash,
        bytes32 fractalHash
    );
    
    event DiscoveryValidated(
        bytes32 indexed discoveryId,
        address indexed discoverer,
        uint256 coherenceScore,
        uint256 densityScore,
        uint256 noveltyScore,
        uint256 reward
    );
    
    event DiscoveryRejected(
        bytes32 indexed discoveryId,
        string reason
    );
    
    event CoherenceDensityUpdated(uint256 newTotalDensity);
    
    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = SyntheverseToken(_token);
        aiValidator = initialOwner; // Owner can validate initially
    }
    
    /**
     * @dev Submit a discovery for validation
     * @param contentHash Semantic hash of the contribution content
     * @param fractalHash Hash of the fractal embedding
     */
    function submitDiscovery(
        bytes32 contentHash,
        bytes32 fractalHash
    ) external nonReentrant returns (bytes32) {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(fractalHash != bytes32(0), "Invalid fractal hash");
        require(!contentHashes[contentHash], "Content already exists (redundant)");
        
        bytes32 discoveryId = keccak256(abi.encodePacked(
            contentHash,
            fractalHash,
            msg.sender,
            block.timestamp
        ));
        
        require(discoveries[discoveryId].discoverer == address(0), "Discovery ID collision");
        
        // Create discovery record (initially unvalidated)
        discoveries[discoveryId] = Discovery({
            contentHash: contentHash,
            fractalHash: fractalHash,
            discoverer: msg.sender,
            coherenceScore: 0,
            densityScore: 0,
            noveltyScore: 0,
            timestamp: block.timestamp,
            validated: false,
            redundant: false
        });
        
        contentHashes[contentHash] = true;
        discoveryIds.push(discoveryId);
        discoveryCount++;
        
        emit DiscoverySubmitted(discoveryId, msg.sender, contentHash, fractalHash);
        
        return discoveryId;
    }
    
    /**
     * @dev Validate a discovery (called by AI validator or authorized address)
     * @param discoveryId The ID of the discovery to validate
     * @param coherenceScore Coherence score from HHF-AI evaluation
     * @param densityScore Density score from HHF-AI evaluation
     * @param noveltyScore Novelty score from HHF-AI evaluation
     */
    function validateDiscovery(
        bytes32 discoveryId,
        uint256 coherenceScore,
        uint256 densityScore,
        uint256 noveltyScore
    ) external {
        require(msg.sender == aiValidator || msg.sender == owner(), "Not authorized to validate");
        
        Discovery storage discovery = discoveries[discoveryId];
        require(discovery.discoverer != address(0), "Discovery does not exist");
        require(!discovery.validated, "Discovery already validated");
        
        // Check if discovery meets minimum thresholds
        bool meetsThresholds = coherenceScore >= minCoherenceScore &&
                               densityScore >= minDensityScore &&
                               noveltyScore >= minNoveltyScore;
        
        if (!meetsThresholds) {
            discovery.redundant = true;
            emit DiscoveryRejected(discoveryId, "Does not meet minimum thresholds");
            return;
        }
        
        // Update discovery with scores
        discovery.coherenceScore = coherenceScore;
        discovery.densityScore = densityScore;
        discovery.noveltyScore = noveltyScore;
        discovery.validated = true;
        
        // Calculate PoD Score: S = Φ × ρ × (1−R) × W
        // Where: Φ = coherence, ρ = density, (1−R) = novelty (non-redundancy), W = epoch weight
        // Scores are 0-10000, so we normalize to 0-1 for calculation
        uint256 podScore = calculatePoDScore(coherenceScore, densityScore, noveltyScore);
        
        // Determine which epoch this discovery qualifies for based on density
        SyntheverseToken.Epoch qualifiedEpoch = determineEpoch(densityScore);
        
        // Update total coherence density
        uint256 contributionDensity = (coherenceScore * densityScore) / 1000;
        totalCoherenceDensity += contributionDensity;
        
        // Update token's coherence density
        token.updateCoherenceDensity(totalCoherenceDensity);
        
        // Calculate reward based on PoD Score and qualified epoch balance
        uint256 reward = calculateReward(podScore, coherenceScore, densityScore, qualifiedEpoch);
        
        // Distribute reward to the qualified epoch
        if (reward > 0 && podScore >= minPoDScore) {
            token.distributeTokens(
                qualifiedEpoch,
                discovery.discoverer,
                reward
            );
        }
        
        emit DiscoveryValidated(
            discoveryId,
            discovery.discoverer,
            coherenceScore,
            densityScore,
            noveltyScore,
            reward
        );
        
        emit CoherenceDensityUpdated(totalCoherenceDensity);
    }
    
    /**
     * @dev Calculate PoD Score: S = Φ × ρ × (1−R) × W
     * Where: Φ = coherence, ρ = density, (1−R) = novelty, W = epoch weight (1.0 for now)
     * Scores are normalized: (coherence/10000) × (density/10000) × (novelty/10000) × 10000
     */
    function calculatePoDScore(
        uint256 coherence,
        uint256 density,
        uint256 novelty
    ) internal pure returns (uint256) {
        // PoD Score: S = (Φ/10000) × (ρ/10000) × (novelty/10000) × 10000
        // This simplifies to: (coherence × density × novelty) / (10000 × 10000)
        // Result is in 0-10000 range
        return (coherence * density * novelty) / (10000 * 10000);
    }
    
    /**
     * @dev Determine which epoch a discovery qualifies for based on density
     * Higher density = earlier epoch (Founders > Pioneer > Public > Ecosystem)
     */
    function determineEpoch(uint256 density) internal view returns (SyntheverseToken.Epoch) {
        if (density >= foundersDensityThreshold) {
            return SyntheverseToken.Epoch.Founders;
        } else if (density >= pioneerDensityThreshold) {
            return SyntheverseToken.Epoch.Pioneer;
        } else if (density >= publicDensityThreshold) {
            return SyntheverseToken.Epoch.Public;
        } else {
            return SyntheverseToken.Epoch.Ecosystem;
        }
    }
    
    /**
     * @dev Calculate reward based on PoD Score and qualified epoch balance
     * Reward = (PoD Score / 10000) × epochRewardPercentage × availableEpochBalance / 10000
     * Capped at maxRewardPercentage of epoch balance
     */
    function calculateReward(
        uint256 podScore,
        uint256 coherence,
        uint256 density,
        SyntheverseToken.Epoch qualifiedEpoch
    ) internal view returns (uint256) {
        
        // Get epoch reserve and distributed amounts for the qualified epoch
        uint256 epochReserve = token.epochReserves(qualifiedEpoch);
        uint256 epochDistributed = token.epochDistributed(qualifiedEpoch);
        uint256 availableBalance = epochReserve > epochDistributed ? epochReserve - epochDistributed : 0;
        
        // For Founders epoch: use epoch reserve (45T) with halving applied
        if (qualifiedEpoch == SyntheverseToken.Epoch.Founders) {
            // Get current halved founder reward pool (starts at 45T, halves based on density)
            uint256 founderRewardPool = token.getCurrentFounderRewardPool();
            uint256 founderDistributed = token.epochDistributed(qualifiedEpoch);
            // Use the smaller of: epoch reserve or halved pool
            uint256 maxAvailable = epochReserve > 0 ? epochReserve : founderRewardPool;
            availableBalance = maxAvailable > founderDistributed ? maxAvailable - founderDistributed : 0;
        }
        
        if (availableBalance == 0) {
            return 0;
        }
        
        // Calculate reward: PoD Score directly translates to percentage of REMAINING available balance
        // Reward = (PoD Score / 10000) × availableBalance
        // Example: PoD Score 7429 = 74.29% of remaining available epoch tokens
        // PoD Score is 0-10000, which directly represents 0-100% of available tokens
        uint256 rewardPercentage = podScore; // Already in basis points (0-10000 = 0-100%)
        
        // Cap at maxRewardPercentage (default 100% = 10000 basis points)
        // But also ensure we don't exceed what's available
        if (rewardPercentage > maxRewardPercentage) {
            rewardPercentage = maxRewardPercentage;
        }
        
        // Calculate reward: (rewardPercentage / 10000) × availableBalance
        // This gives the exact percentage of REMAINING available tokens based on PoD Score
        uint256 reward = (availableBalance * rewardPercentage) / 10000;
        
        // Ensure reward doesn't exceed available balance (critical safety check)
        if (reward > availableBalance) {
            reward = availableBalance;
        }
        
        return reward;
    }
    
    /**
     * @dev Set AI validator address
     */
    function setAIValidator(address _aiValidator) external onlyOwner {
        require(_aiValidator != address(0), "Invalid address");
        aiValidator = _aiValidator;
    }
    
    /**
     * @dev Update validation thresholds
     */
    function setThresholds(
        uint256 _minCoherence,
        uint256 _minDensity,
        uint256 _minNovelty
    ) external onlyOwner {
        minCoherenceScore = _minCoherence;
        minDensityScore = _minDensity;
        minNoveltyScore = _minNovelty;
    }
    
    /**
     * @dev Update epoch qualification thresholds
     */
    function setEpochThresholds(
        uint256 _foundersThreshold,
        uint256 _pioneerThreshold,
        uint256 _publicThreshold
    ) external onlyOwner {
        foundersDensityThreshold = _foundersThreshold;
        pioneerDensityThreshold = _pioneerThreshold;
        publicDensityThreshold = _publicThreshold;
    }
    
    /**
     * @dev Get which epoch a discovery would qualify for based on density
     */
    function getQualifiedEpoch(uint256 density) external view returns (SyntheverseToken.Epoch) {
        return determineEpoch(density);
    }
    
    /**
     * @dev Update reward configuration
     */
    function setRewardConfig(
        uint256 _minPoDScore,
        uint256 _maxRewardPercentage
    ) external onlyOwner {
        minPoDScore = _minPoDScore;
        maxRewardPercentage = _maxRewardPercentage;
    }
    
    /**
     * @dev Get discovery details
     */
    function getDiscovery(bytes32 discoveryId) external view returns (Discovery memory) {
        return discoveries[discoveryId];
    }
    
    /**
     * @dev Get total number of discoveries
     */
    function getDiscoveryCount() external view returns (uint256) {
        return discoveryCount;
    }
    
    /**
     * @dev Get all discovery IDs (paginated)
     */
    function getDiscoveryIds(uint256 offset, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        uint256 end = offset + limit;
        if (end > discoveryIds.length) {
            end = discoveryIds.length;
        }
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = discoveryIds[i];
        }
        
        return result;
    }
}


