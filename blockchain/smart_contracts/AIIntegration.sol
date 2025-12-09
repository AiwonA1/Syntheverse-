// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfDiscovery.sol";

/**
 * @title AIIntegration
 * @dev Interface contract for Syntheverse AI (HHF-AI) integration
 * This contract acts as a bridge between off-chain AI validation and on-chain discovery protocol
 */
contract AIIntegration is Ownable {
    ProofOfDiscovery public podContract;
    
    // AI validation request structure
    struct ValidationRequest {
        bytes32 discoveryId;
        bytes32 contentHash;
        bytes32 fractalHash;
        address discoverer;
        uint256 timestamp;
        bool processed;
    }
    
    // Storage
    mapping(bytes32 => ValidationRequest) public validationRequests;
    bytes32[] public pendingRequests;
    
    // Authorized AI validators (can be updated to point to AI service)
    mapping(address => bool) public authorizedValidators;
    
    // Events
    event ValidationRequested(
        bytes32 indexed discoveryId,
        bytes32 contentHash,
        bytes32 fractalHash,
        address indexed discoverer
    );
    
    event ValidationProcessed(
        bytes32 indexed discoveryId,
        uint256 coherenceScore,
        uint256 densityScore,
        uint256 noveltyScore,
        bool validated
    );
    
    constructor(address _podContract, address initialOwner) Ownable(initialOwner) {
        podContract = ProofOfDiscovery(_podContract);
        authorizedValidators[initialOwner] = true;
    }
    
    /**
     * @dev Request AI validation for a discovery
     * This can be called automatically when a discovery is submitted
     */
    function requestValidation(
        bytes32 discoveryId,
        bytes32 contentHash,
        bytes32 fractalHash,
        address discoverer
    ) external {
        require(msg.sender == address(podContract) || msg.sender == owner(), "Not authorized");
        
        ValidationRequest storage request = validationRequests[discoveryId];
        require(!request.processed, "Request already processed");
        
        if (request.discoverer == address(0)) {
            request.discoveryId = discoveryId;
            request.contentHash = contentHash;
            request.fractalHash = fractalHash;
            request.discoverer = discoverer;
            request.timestamp = block.timestamp;
            request.processed = false;
            pendingRequests.push(discoveryId);
        }
        
        emit ValidationRequested(discoveryId, contentHash, fractalHash, discoverer);
    }
    
    /**
     * @dev Process AI validation results
     * Called by authorized AI validator with HHF-AI evaluation scores
     */
    function processValidation(
        bytes32 discoveryId,
        uint256 coherenceScore,
        uint256 densityScore,
        uint256 noveltyScore
    ) external {
        require(authorizedValidators[msg.sender], "Not authorized validator");
        
        ValidationRequest storage request = validationRequests[discoveryId];
        require(!request.processed, "Request already processed");
        require(request.discoverer != address(0), "Request does not exist");
        
        request.processed = true;
        
        // Forward validation to ProofOfDiscovery contract
        podContract.validateDiscovery(
            discoveryId,
            coherenceScore,
            densityScore,
            noveltyScore
        );
        
        emit ValidationProcessed(
            discoveryId,
            coherenceScore,
            densityScore,
            noveltyScore,
            true
        );
    }
    
    /**
     * @dev Batch process multiple validations
     */
    function batchProcessValidation(
        bytes32[] calldata discoveryIds,
        uint256[] calldata coherenceScores,
        uint256[] calldata densityScores,
        uint256[] calldata noveltyScores
    ) external {
        require(authorizedValidators[msg.sender], "Not authorized validator");
        require(
            discoveryIds.length == coherenceScores.length &&
            coherenceScores.length == densityScores.length &&
            densityScores.length == noveltyScores.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < discoveryIds.length; i++) {
            bytes32 discoveryId = discoveryIds[i];
            ValidationRequest storage request = validationRequests[discoveryId];
            
            if (!request.processed && request.discoverer != address(0)) {
                request.processed = true;
                
                // Forward validation to ProofOfDiscovery contract
                podContract.validateDiscovery(
                    discoveryId,
                    coherenceScores[i],
                    densityScores[i],
                    noveltyScores[i]
                );
                
                emit ValidationProcessed(
                    discoveryId,
                    coherenceScores[i],
                    densityScores[i],
                    noveltyScores[i],
                    true
                );
            }
        }
    }
    
    /**
     * @dev Authorize an AI validator address
     */
    function authorizeValidator(address validator) external onlyOwner {
        authorizedValidators[validator] = true;
    }
    
    /**
     * @dev Revoke validator authorization
     */
    function revokeValidator(address validator) external onlyOwner {
        authorizedValidators[validator] = false;
    }
    
    /**
     * @dev Get pending validation requests
     */
    function getPendingRequests(uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 end = offset + limit;
        if (end > pendingRequests.length) {
            end = pendingRequests.length;
        }
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = pendingRequests[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get total pending requests
     */
    function getPendingRequestCount() external view returns (uint256) {
        return pendingRequests.length;
    }
}


