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
    
    // Rewards configuration
    uint256 public baseReward = 1000 * 10**18;   // Base reward in tokens
    uint256 public coherenceMultiplier = 100;     // Multiplier for coherence (in basis points)
    uint256 public densityMultiplier = 50;       // Multiplier for density (in basis points)
    
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
        
        // Calculate reward based on scores
        uint256 reward = calculateReward(coherenceScore, densityScore, noveltyScore);
        
        // Update total coherence density
        uint256 contributionDensity = (coherenceScore * densityScore) / 1000;
        totalCoherenceDensity += contributionDensity;
        
        // Update token's coherence density
        token.updateCoherenceDensity(totalCoherenceDensity);
        
        // Distribute reward - use current epoch
        if (reward > 0) {
            SyntheverseToken.Epoch currentEpoch = token.currentEpoch();
            token.distributeTokens(
                currentEpoch,
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
     * @dev Calculate reward based on discovery scores
     */
    function calculateReward(
        uint256 coherence,
        uint256 density,
        uint256 novelty
    ) internal view returns (uint256) {
        // Base reward with multipliers
        uint256 coherenceBonus = (baseReward * coherence * coherenceMultiplier) / (10000 * 10000);
        uint256 densityBonus = (baseReward * density * densityMultiplier) / (10000 * 10000);
        uint256 noveltyBonus = (baseReward * novelty) / 10000;
        
        return baseReward + coherenceBonus + densityBonus + noveltyBonus;
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
     * @dev Update reward configuration
     */
    function setRewardConfig(
        uint256 _baseReward,
        uint256 _coherenceMultiplier,
        uint256 _densityMultiplier
    ) external onlyOwner {
        baseReward = _baseReward;
        coherenceMultiplier = _coherenceMultiplier;
        densityMultiplier = _densityMultiplier;
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


