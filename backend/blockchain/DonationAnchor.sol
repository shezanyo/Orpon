// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DonationAnchor
 * @dev Stores hashes of the donation hash chain on the Polygon Amoy Testnet.
 * By anchoring the hash on a public blockchain, we ensure the integrity 
 * of the centralized database cannot be compromised without detection.
 */
contract DonationAnchor {
    
    address public owner;
    
    struct Anchor {
        uint256 batchId;
        string finalHash;
        uint256 timestamp;
    }
    
    // Mapping from batchId to its corresponding Anchor
    mapping(uint256 => Anchor) public anchors;
    
    // Keep track of the total number of batches anchored
    uint256 public totalBatches;

    // Event emitted whenever a new hash is anchored
    event HashAnchored(uint256 indexed batchId, string finalHash, uint256 timestamp);

    // Modifier to restrict function access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /**
     * @dev Constructor sets the deployer as the owner of the contract.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Anchors a new hash on the blockchain.
     * @param _batchId The unique identifier for the batch of donations.
     * @param _finalHash The SHA-256 hash representing the end of the chain for this batch.
     */
    function storeHash(uint256 _batchId, string memory _finalHash) public onlyOwner {
        require(bytes(_finalHash).length > 0, "Hash cannot be empty");
        require(anchors[_batchId].timestamp == 0, "Batch ID already anchored");

        anchors[_batchId] = Anchor({
            batchId: _batchId,
            finalHash: _finalHash,
            timestamp: block.timestamp
        });

        totalBatches++;

        emit HashAnchored(_batchId, _finalHash, block.timestamp);
    }

    /**
     * @dev Retrieves the anchored hash details for a specific batch.
     * @param _batchId The batch ID to query.
     * @return finalHash The stored hash for the batch.
     * @return timestamp The time the hash was stored.
     */
    function getBatch(uint256 _batchId) public view returns (string memory finalHash, uint256 timestamp) {
        require(anchors[_batchId].timestamp != 0, "Batch ID not found");
        Anchor memory anchor = anchors[_batchId];
        return (anchor.finalHash, anchor.timestamp);
    }
}
