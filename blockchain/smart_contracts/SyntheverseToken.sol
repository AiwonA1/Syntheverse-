// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SyntheverseToken
 * @dev ERC20 token for Syntheverse ecosystem
 * Total Supply: 90 Trillion (90,000,000,000,000)
 * Multi-epoch distribution model with dynamic reserves
 */
contract SyntheverseToken is ERC20, ERC20Burnable, Ownable, Pausable {
    // Total supply: 90 Trillion
    uint256 public constant TOTAL_SUPPLY = 90_000_000_000_000 * 10**18;
    
    // Epoch management
    enum Epoch { Founders, Pioneer, Public, Ecosystem }
    Epoch public currentEpoch = Epoch.Founders;
    
    // Epoch reserves
    mapping(Epoch => uint256) public epochReserves;
    mapping(Epoch => uint256) public epochDistributed;
    
    // Coherence density threshold for epoch progression
    uint256 public coherenceDensityThreshold = 1000; // Minimum coherence units
    
    // Dynamic founder allocation based on coherence density
    uint256 public founderAllocation = 0;
    uint256 public coherenceDensity = 0;
    
    // Halving epochs for founder rewards
    uint256 public founderEpochNumber = 0; // Current founder epoch (halving cycle)
    uint256 public constant FOUNDER_EPOCH_HALVING_INTERVAL = 1000000; // Coherence density units per halving
    uint256 public constant INITIAL_FOUNDER_REWARD_POOL = TOTAL_SUPPLY * 50 / 100; // 45T for Founders epoch
    
    // Addresses authorized for epoch distributions
    mapping(address => bool) public authorizedDistributors;
    
    event EpochAdvanced(Epoch indexed from, Epoch indexed to);
    event CoherenceDensityUpdated(uint256 newDensity);
    event TokensDistributed(Epoch indexed epoch, address indexed recipient, uint256 amount);
    
    constructor(address initialOwner) ERC20("Syntheverse", "SYNTH") Ownable(initialOwner) {
        // Initialize epoch reserves
        // Founders: 50% of total supply (45T) with halving epochs
        epochReserves[Epoch.Founders] = TOTAL_SUPPLY * 50 / 100; // 45T
        // Pioneer: 10% of total supply (9T)
        epochReserves[Epoch.Pioneer] = TOTAL_SUPPLY * 10 / 100;
        // Public: 20% of total supply (18T)
        epochReserves[Epoch.Public] = TOTAL_SUPPLY * 20 / 100;
        // Ecosystem: 20% of total supply (18T) - remaining
        epochReserves[Epoch.Ecosystem] = TOTAL_SUPPLY * 20 / 100;
        
        // Authorize owner as initial distributor
        authorizedDistributors[initialOwner] = true;
    }
    
    /**
     * @dev Update coherence density (called by Proof-of-Discovery contract)
     */
    function updateCoherenceDensity(uint256 newDensity) external {
        require(
            msg.sender == address(this) || authorizedDistributors[msg.sender],
            "Not authorized"
        );
        coherenceDensity = newDensity;
        emit CoherenceDensityUpdated(newDensity);
        
        // Adjust founder allocation dynamically based on coherence
        if (currentEpoch == Epoch.Founders) {
            // Update founder epoch number based on halving intervals
            uint256 newEpochNumber = newDensity / FOUNDER_EPOCH_HALVING_INTERVAL;
            if (newEpochNumber > founderEpochNumber) {
                founderEpochNumber = newEpochNumber;
            }
            founderAllocation = calculateFounderAllocation(newDensity);
        }
        
        // Check if we can advance to next epoch
        if (coherenceDensity >= coherenceDensityThreshold && currentEpoch != Epoch.Ecosystem) {
            advanceEpoch();
        }
    }
    
    /**
     * @dev Calculate founder allocation based on coherence density with halving
     * Halving epochs: rewards halve every FOUNDER_EPOCH_HALVING_INTERVAL coherence density units
     * Starting from 45T (Founders epoch pool), then 22.5T, 11.25T, 5.625T, etc.
     * 
     * Founders epoch has its own 45T pool (50% of total supply)
     * Halving happens at intervals (every 1M coherence density units)
     */
    function calculateFounderAllocation(uint256 density) internal view returns (uint256) {
        // For the first halving epoch (density < halving interval), use full 45T Founders pool
        if (density < FOUNDER_EPOCH_HALVING_INTERVAL) {
            return INITIAL_FOUNDER_REWARD_POOL; // 45T
        }
        
        // Calculate which halving epoch we're in
        uint256 epochNumber = density / FOUNDER_EPOCH_HALVING_INTERVAL;
        
        // Limit halving to prevent pool from becoming too small
        // Cap at reasonable number of halvings
        if (epochNumber > 10) {
            epochNumber = 10;
        }
        
        // Calculate halved reward pool: 45T / (2^epochNumber)
        uint256 halvedPool = INITIAL_FOUNDER_REWARD_POOL; // Start with 45T
        
        // Halve for each epoch
        for (uint256 i = 0; i < epochNumber; i++) {
            halvedPool = halvedPool / 2;
        }
        
        // Ensure minimum pool size (at least 0.5% of total supply = 450B tokens)
        uint256 minPool = TOTAL_SUPPLY / 200;
        if (halvedPool < minPool) {
            halvedPool = minPool;
        }
        
        return halvedPool;
    }
    
    /**
     * @dev Get current founder epoch number (halving cycle)
     */
    function getFounderEpochNumber() external view returns (uint256) {
        return founderEpochNumber;
    }
    
    /**
     * @dev Get current halved founder reward pool
     */
    function getCurrentFounderRewardPool() external view returns (uint256) {
        return calculateFounderAllocation(coherenceDensity);
    }
    
    /**
     * @dev Advance to next epoch when threshold is met
     */
    function advanceEpoch() internal {
        require(currentEpoch != Epoch.Ecosystem, "Already at final epoch");
        
        Epoch previousEpoch = currentEpoch;
        
        if (currentEpoch == Epoch.Founders) {
            currentEpoch = Epoch.Pioneer;
        } else if (currentEpoch == Epoch.Pioneer) {
            currentEpoch = Epoch.Public;
        } else if (currentEpoch == Epoch.Public) {
            currentEpoch = Epoch.Ecosystem;
        }
        
        emit EpochAdvanced(previousEpoch, currentEpoch);
    }
    
    /**
     * @dev Distribute tokens for a specific epoch
     */
    function distributeTokens(
        Epoch epoch,
        address recipient,
        uint256 amount
    ) external onlyAuthorized {
        require(epoch == currentEpoch || epoch == Epoch.Founders, "Invalid epoch");
        
        // For Founders epoch with dynamic allocation
        if (epoch == Epoch.Founders && epochReserves[epoch] == 0) {
            // Use founderAllocation as the reserve for Founders epoch
            // If founderAllocation is 0, allow small distributions (for testing)
            uint256 maxAllocation = founderAllocation > 0 ? founderAllocation : TOTAL_SUPPLY;
            require(epochDistributed[epoch] + amount <= maxAllocation, "Exceeds founder allocation");
        } else {
            require(epochDistributed[epoch] + amount <= epochReserves[epoch], "Exceeds epoch reserve");
        }
        
        epochDistributed[epoch] += amount;
        _mint(recipient, amount);
        
        emit TokensDistributed(epoch, recipient, amount);
    }
    
    /**
     * @dev Authorize an address to distribute tokens
     */
    function authorizeDistributor(address distributor) external onlyOwner {
        authorizedDistributors[distributor] = true;
    }
    
    /**
     * @dev Revoke distributor authorization
     */
    function revokeDistributor(address distributor) external onlyOwner {
        authorizedDistributors[distributor] = false;
    }
    
    /**
     * @dev Set coherence density threshold for epoch progression
     */
    function setCoherenceDensityThreshold(uint256 threshold) external onlyOwner {
        coherenceDensityThreshold = threshold;
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to respect pause
     */
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
    
    modifier onlyAuthorized() {
        require(authorizedDistributors[msg.sender], "Not authorized distributor");
        _;
    }
}


