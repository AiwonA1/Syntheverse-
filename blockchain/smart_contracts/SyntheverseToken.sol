// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

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
    
    // Addresses authorized for epoch distributions
    mapping(address => bool) public authorizedDistributors;
    
    event EpochAdvanced(Epoch indexed from, Epoch indexed to);
    event CoherenceDensityUpdated(uint256 newDensity);
    event TokensDistributed(Epoch indexed epoch, address indexed recipient, uint256 amount);
    
    constructor(address initialOwner) ERC20("Syntheverse", "SYNTH") Ownable(initialOwner) {
        // Initialize epoch reserves
        // Founders: Dynamic (starts at 0, adjusts based on coherence)
        epochReserves[Epoch.Founders] = 0;
        // Pioneer: 10% of total supply
        epochReserves[Epoch.Pioneer] = TOTAL_SUPPLY * 10 / 100;
        // Public: 40% of total supply
        epochReserves[Epoch.Public] = TOTAL_SUPPLY * 40 / 100;
        // Ecosystem: 50% of total supply (remaining)
        epochReserves[Epoch.Ecosystem] = TOTAL_SUPPLY * 50 / 100;
        
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
            founderAllocation = calculateFounderAllocation(newDensity);
        }
        
        // Check if we can advance to next epoch
        if (coherenceDensity >= coherenceDensityThreshold && currentEpoch != Epoch.Ecosystem) {
            advanceEpoch();
        }
    }
    
    /**
     * @dev Calculate founder allocation based on coherence density
     */
    function calculateFounderAllocation(uint256 density) internal pure returns (uint256) {
        // Dynamic formula: allocation increases with density, capped at 10% of total
        uint256 maxFounderAllocation = TOTAL_SUPPLY * 10 / 100;
        uint256 calculated = (density * maxFounderAllocation) / 10000;
        return calculated > maxFounderAllocation ? maxFounderAllocation : calculated;
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
        require(epochDistributed[epoch] + amount <= epochReserves[epoch], "Exceeds epoch reserve");
        
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


