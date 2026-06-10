# Smart Contract Deployment Guide (Polygon Amoy)

Follow these steps to deploy the `DonationAnchor.sol` smart contract to the Polygon Amoy Testnet.

## Prerequisites
1. **MetaMask Wallet**: Install the [MetaMask browser extension](https://metamask.io/).
2. **Polygon Amoy Network**: Add the Amoy testnet to MetaMask.
   - Network Name: Polygon Amoy Testnet
   - New RPC URL: `https://rpc-amoy.polygon.technology/`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC` (or `POL`)
   - Block Explorer URL: `https://amoy.polygonscan.com/`
3. **Test MATIC**: Get some test MATIC from the [Polygon Faucet](https://faucet.polygon.technology/).

## Deployment via Remix IDE

1. **Open Remix**: Go to [Remix IDE](https://remix.ethereum.org/).
2. **Create File**: Under the `contracts` folder, create a new file called `DonationAnchor.sol`.
3. **Copy Code**: Copy the entire contents of `backend/blockchain/DonationAnchor.sol` and paste it into the new file in Remix.
4. **Compile**: 
   - Click the "Solidity Compiler" tab on the left.
   - Select compiler version `0.8.20` or higher.
   - Click "Compile DonationAnchor.sol".
5. **Deploy**:
   - Click the "Deploy & Run Transactions" tab on the left.
   - Change the **Environment** dropdown to **Injected Provider - MetaMask**.
   - Ensure MetaMask prompts you to connect and is set to the **Polygon Amoy Testnet**.
   - Make sure `DonationAnchor` is selected in the "Contract" dropdown.
   - Click **Deploy**.
   - MetaMask will prompt you to confirm the transaction. Click **Confirm**.
6. **Get Contract Address**:
   - Once deployed, it will appear under "Deployed Contracts" at the bottom left.
   - Copy the contract address (using the copy icon next to the contract name).
7. **Get Private Key**:
   - In MetaMask, go to "Account Details" -> "Show Private Key".
   - Copy your private key (DO NOT SHARE THIS!).

## Environment Variables
Once deployed, you need to add the following to your `backend/.env` file:

```env
# Blockchain Anchoring (Polygon Amoy)
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology/"
CONTRACT_ADDRESS="<YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE>"
WALLET_PRIVATE_KEY="<YOUR_METAMASK_PRIVATE_KEY_HERE>"
```

*(You will use an Alchemy or Infura URL for `POLYGON_RPC_URL` in a real production environment for better reliability)*
