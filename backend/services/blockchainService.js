const { ethers } = require("ethers");
require("dotenv").config();

// Contract ABI (Only the functions we need)
const contractABI = [
    "function storeHash(uint256 _batchId, string memory _finalHash) public",
    "function getBatch(uint256 _batchId) public view returns (string memory finalHash, uint256 timestamp)"
];

class BlockchainService {
    constructor() {
        this.rpcUrl = process.env.POLYGON_RPC_URL;
        this.privateKey = process.env.WALLET_PRIVATE_KEY;
        this.contractAddress = process.env.CONTRACT_ADDRESS;

        if (!this.rpcUrl || !this.privateKey || !this.contractAddress) {
            console.warn("⚠️ Blockchain anchoring is disabled. Missing environment variables.");
            this.isConfigured = false;
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
            this.wallet = new ethers.Wallet(this.privateKey, this.provider);
            this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);
            this.isConfigured = true;
            console.log("🔗 BlockchainService initialized for Polygon Amoy.");
        } catch (error) {
            console.error("❌ Failed to initialize BlockchainService:", error.message);
            this.isConfigured = false;
        }
    }

    /**
     * Anchors a final hash to the blockchain.
     * @param {number} batchId 
     * @param {string} finalHash 
     * @returns {Promise<string|null>} The transaction hash or null if failed.
     */
    async anchorHash(batchId, finalHash) {
        if (!this.isConfigured) {
            console.warn("Blockchain anchoring skipped (not configured).");
            return null;
        }

        try {
            console.log(`Sending anchor transaction for batch ${batchId}...`);
            const tx = await this.contract.storeHash(batchId, finalHash);
            console.log(`Transaction submitted! Hash: ${tx.hash}`);
            
            // Wait for 1 confirmation
            const receipt = await tx.wait(1);
            console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
            
            return receipt.hash;
        } catch (error) {
            console.error(`❌ Failed to anchor hash for batch ${batchId}:`, error);
            throw error;
        }
    }

    /**
     * Retrieves an anchored hash from the blockchain.
     * @param {number} batchId 
     * @returns {Promise<{finalHash: string, timestamp: number}|null>}
     */
    async getAnchoredHash(batchId) {
        if (!this.isConfigured) return null;

        try {
            const data = await this.contract.getBatch(batchId);
            return {
                finalHash: data.finalHash,
                timestamp: Number(data.timestamp)
            };
        } catch (error) {
            console.error(`❌ Failed to fetch anchor for batch ${batchId}:`, error.message);
            return null;
        }
    }
}

// Export as a singleton
module.exports = new BlockchainService();
