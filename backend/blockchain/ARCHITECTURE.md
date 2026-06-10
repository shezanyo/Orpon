# Blockchain Anchoring Architecture

## Architecture Flow Diagram
```text
[ Donor ]
   |
   | (Donates via Frontend)
   v
[ Backend API ] -> Validates donation -> Creates "Pending" record in Database
   |
   | (Payment confirmation)
   v
[ Hash Service ] -> Computes new hash using (Data + Previous_Hash)
   |
   v
[ Azure SQL Database ] -> Updates record to "Completed" with new current_hash
   |
   | (Triggers Auto-Anchor Check)
   v
[ Is Total % 10 === 0? ]
   |
   +-- No -> End
   |
   +-- Yes -> [ Blockchain Service ]
                   |
                   | (Ethers.js via JSON-RPC)
                   v
           [ Polygon Amoy Testnet ] -> Executes `storeHash` on Smart Contract
                   |
                   | (Returns TxHash)
                   v
           [ Azure SQL Database ] -> Saves (BatchID, FinalHash, TxHash) in `blockchain_anchors`
```

## How It Works
1. **Local Hash Chain:** Every completed donation calculates its cryptographic hash by hashing its own data along with the hash of the immediately preceding donation. This forms a local hash chain.
2. **Blockchain Anchoring:** Because a central database can be fully modified by an administrator, the latest hash of the local chain is periodically sent to a public blockchain (Polygon Amoy).
3. **Immutability:** Once the final hash is stored on Polygon, it cannot be tampered with. 
4. **Verification:** The integrity auditor recalculates the entire local chain. If the local chain is internally valid, it then fetches the latest anchor from Polygon. If the local final hash matches the Polygon final hash, the system proves cryptographically that no historical data has been altered.

## API Documentation

### 1. Get Blockchain Status
- **Endpoint:** `GET /api/anchors/status`
- **Description:** Returns the latest anchored batch details and the number of pending (unanchored) donations.
- **Access:** Admin only
- **Response:**
```json
{
  "success": true,
  "last_anchor": {
    "id": 1,
    "batch_id": 2,
    "final_hash": "a1b2c3d4...",
    "tx_hash": "0x123abc...",
    "created_at": "2026-06-07T10:00:00Z"
  },
  "pending_donations": 4,
  "total_donations": 24
}
```

### 2. Manual Anchor
- **Endpoint:** `POST /api/anchors/manual`
- **Description:** Forces an immediate anchor of the latest donation hash to the blockchain, regardless of the 10-donation threshold.
- **Access:** Admin only
- **Response:**
```json
{
  "success": true,
  "message": "Successfully anchored to Polygon.",
  "batch_id": 3,
  "tx_hash": "0x456def..."
}
```

### 3. Get Anchor History
- **Endpoint:** `GET /api/anchors/history`
- **Description:** Retrieves the history of all stored anchors.
- **Access:** Public
- **Response:**
```json
{
  "success": true,
  "total": 2,
  "anchors": [ ... ]
}
```

## Environment Variables
The following environment variables must be added to your `backend/.env` file:

```env
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology/"
CONTRACT_ADDRESS="0xYourDeployedContractAddressHere"
WALLET_PRIVATE_KEY="0xYourWalletPrivateKeyHere"
```

## Testing the System
1. Go to the Admin Dashboard.
2. Ensure you have an active RPC connection and test MATIC in your wallet.
3. Click **Anchor Now** to manually trigger a blockchain save.
4. Go to **Verify Integrity**. The system will now not only check local database hashes but will also pull data from Polygon to ensure 100% data integrity.
