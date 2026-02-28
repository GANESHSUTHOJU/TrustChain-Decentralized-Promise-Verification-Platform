# TrustChain

TrustChain is a simple decentralized application (dApp) for creating, tracking, and verifying promises on a blockchain. It consists of a Solidity smart contract, a web frontend, and uses Hardhat for local development.

## Key Concepts

- **Smart Contract**: `contracts/TrustChain.sol` holds promise data and enforces rules about who can mark a promise fulfilled.
- **Frontend**: `frontend/index.html` and `frontend/app.js` let users interact with the contract through a web browser.
- **Local Blockchain**: Hardhat provides a local Ethereum‑like network where you can deploy and test without spending real money.

## Faucets & Gas Fees

### What is a faucet?

A **faucet** is a service that gives you free testnet Ether (or other tokens) so developers can try transactions without using real money. They are typically websites where you paste your testnet account address and receive a small allocation of tokens.

- Example faucets:
  - [Ropsten faucet](https://faucet.ropsten.be/)
  - [Goerli faucet](https://goerli-faucet.slock.it/)

You only need faucets when you are working on a public testnet (like Goerli, Sepolia, etc.). When running the project locally with Hardhat, the node automatically pre‑funds ten accounts for you, so you don’t need a faucet at all.

### What are gas fees?

Every action on Ethereum (including testnets) costs a small amount of Ether called a **gas fee**. The fee is computed as:

```
Gas used × Gas price (in gwei)
```

`Gas used` depends on how much work the operation requires (e.g. storing data is more expensive than reading it). `Gas price` changes with network demand.

- On a local Hardhat node you don’t pay real money – the `gas` value is simulated, but it helps you understand costs.
- On a public testnet you do spend test Ether, which you get from a faucet.

The app code now estimates gas before sending a transaction and logs the cost to the console.

## Connecting MetaMask

The frontend uses `ethers.js` to connect to MetaMask. When you click **Connect Wallet** the following code runs (excerpt from `frontend/app.js`):

```js
async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      updateUIOnWalletConnect();
      loadPromises();
    } catch (error) {
      console.error("User rejected wallet connection");
    }
  } else {
    alert("Please install MetaMask!");
  }
}
```

MetaMask must be configured to the same network as the contract. For local development:

1. Start the Hardhat node (`npm run node`).
2. In MetaMask, open **Settings > Networks > Add Network** and enter:
   - **Network Name**: Localhost 8545 (or any you like)
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: 31337 (Hardhat default) or 1337
   - Currency symbol: ETH
   - Leave other fields blank.
3. After saving, switch MetaMask to that network.
4. MetaMask will show a list of test accounts with private keys in the terminal where `npm run node` is running. Click **Export** on one of those accounts and copy the key.
5. In MetaMask select **Import account** and paste the private key. You’ll now see some fake ETH in that wallet.
6. Back on the web page, click the **Connect Wallet** button. The UI will automatically detect your address and display it in the header and on the dashboard.

**Troubleshooting**

- If the button does nothing, make sure MetaMask is unlocked and on the localhost network.
- A message is shown beside the button reminding you to set the network correctly.
- If you try to connect on the wrong network, an alert will ask you to switch.
- The input fields on the page have placeholders (`e.g. Finish project`, `Describe the promise`, `e.g. 0`) to show what to enter.

### Debugging connection

Open the browser developer console (F12) while viewing the page. You should see `app.js loaded` when the script runs. The two status paragraphs under the button (`walletStatus` and `detectionStatus`) will display messages such as:

- `No wallet extension detected.` → you're not running from a web server or MetaMask isn't installed.
- `Wallet extension detected.` → the extension is present; if it changes to `Requesting connection...` then the click handler fired.
- `Connection failed:` or `Wrong network` errors will appear both on the page and in the console.

These diagnostics make it easier to understand why MetaMask might not respond.

## Estimating Gas in the UI

The `app.js` script now calculates how much gas a transaction will use before sending it, along with the current gas price:

```js
const estimated = await contract.estimateGas.createPromise(
  title,
  description,
  category,
);
const gasPrice = await provider.getGasPrice();
console.log(
  "Estimated gas",
  estimated.toString(),
  "gas price",
  gasPrice.toString(),
);
console.log("Estimated fee (wei)", estimated.mul(gasPrice).toString());
```

This helps users understand how much test Ether they will spend.

## Running the Project Locally

```bash
npm install        # install dependencies
npm run compile    # compile smart contract
npm run node       # start local blockchain
npm run deploy:localhost
npm run start      # serve frontend
```

Then open the URL shown by `npm run start` in your browser (for example `http://localhost:5000`). **Do not open `index.html` directly with `file://`** – the wallet extension won't inject `window.ethereum` when the page is loaded from the filesystem. Connect MetaMask, and start creating promises!

---

Feel free to explore further: deploy to a public testnet (after updating `contractAddress`), add a real faucet integration, or extend the UI with more features.
