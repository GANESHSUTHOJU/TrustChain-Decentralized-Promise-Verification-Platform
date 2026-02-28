const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Deployed to local Hardhat node
console.log('app.js loaded');
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "PromiseCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "PromiseFulfilled",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "category",
        "type": "string"
      }
    ],
    "name": "createPromise",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPromises",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "category",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          }
        ],
        "internalType": "struct TrustChain.Promise[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getPromise",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "category",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          }
        ],
        "internalType": "struct TrustChain.Promise",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "fulfillPromise",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let provider;
let signer;
let contract;

const connectWalletBtn = document.getElementById('connectWalletBtn');
const createPromiseForm = document.getElementById('createPromiseForm');
const recentPromisesDiv = document.getElementById('recentPromises');
const allPromisesDiv = document.getElementById('allPromises');
const totalPromisesCard = document.getElementById('totalPromises');
const fulfilledPromisesCard = document.getElementById('fulfilledPromises');
const pendingPromisesCard = document.getElementById('pendingPromises');
const verifyPromiseForm = document.getElementById('verifyPromiseForm');
const verifyResultDiv = document.getElementById('verifyResult');

async function connectWallet() {
  if (typeof ethers === 'undefined') {
    console.error('ethers library not found');
    alert('Ethers.js library not loaded. Check console/network or your internet connection.');
    return;
  }

  if (!window.ethereum) {
    alert('MetaMask not detected. Please install a wallet extension.');
    return;
  }

  try {
    console.log('attempting wallet connection');
    // request accounts
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // ensure correct network (Hardhat localhost chain id 31337)
    const desiredChainId = '0x7a69'; // 31337 in hex
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainId }],
      });
      console.log('switched to Hardhat network');
    } catch (switchError) {
      console.log('network switch failed or not needed', switchError);
      // if chain is not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: desiredChainId,
              chainName: 'Hardhat Localhost',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            }],
          });
          console.log('added and switched to Hardhat network');
        } catch (addError) {
          console.error('failed to add network', addError);
        }
      }
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    // success
    updateUIOnWalletConnect();
    loadPromises();
    const address = await signer.getAddress();
    alert('Wallet connected: ' + shortenAddress(address));

    // verify network
    const net = await provider.getNetwork();
    console.log('connected to chain', net.chainId);
    if (net.chainId !== 31337 && net.chainId !== 1337) {
      console.warn('⚠️ You are not on the local Hardhat chain. ChainId:', net.chainId);
    }

    // automatically top-up zero balances on Hardhat (account for BigNumber or BigInt)
    let balRaw = await provider.getBalance(address);
    // ethers v6 returns BigInt but some providers may return BigNumber
    let bal;
    if (typeof balRaw === 'bigint') {
      bal = balRaw;
    } else if (balRaw && typeof balRaw.toString === 'function') {
      bal = BigInt(balRaw.toString());
    } else {
      bal = BigInt(balRaw);
    }
    console.log('wallet balance after connect', bal.toString(), '(type', typeof balRaw + ')');
    if (bal === 0n) {
      try {
        // use a direct JSON-RPC provider to call hardhat_setBalance (MetaMask provider doesn't support it)
        const rpcProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const topUp = '0x' + (100n * 10n**18n).toString(16);
        await rpcProvider.send('hardhat_setBalance', [address, topUp]);
        console.log('✅ Address topped up with 100 ETH via node.');
      } catch (e) {
        // ignore if method unsupported/remote; user can fund manually via hardhat account
        console.warn('balance top-up failed or not available', e);
      }
    }
  } catch (error) {
    console.error('Wallet connection error', error);
    alert('Failed to connect wallet: ' + (error && (error.message || error) ? (error.message || error) : 'Unknown error'));
  }
}

function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

async function updateUIOnWalletConnect() {
  const address = await signer.getAddress();
  connectWalletBtn.textContent = shortenAddress(address);
  connectWalletBtn.disabled = true;
  const walletInfo = document.getElementById('walletInfo');
  if (walletInfo) {
    walletInfo.textContent = 'Connected: ' + shortenAddress(address);
  }
}

async function loadPromises() {
  try {
    const promises = await contract.getPromises();
    console.log('Promises loaded:', promises);
    console.log('Number of promises:', promises.length);
    displayPromises(promises);
    updateStats(promises);
  } catch (error) {
    console.error('Error loading promises:', error);
    alert('Error loading promises: ' + error.message);
  }
}

// ensure wallet status paragraph is correct on page load if already connected
window.addEventListener('load', async () => {
  const statusEl = document.getElementById('walletStatus');
  const detectEl = document.getElementById('detectionStatus');
  if (window.ethereum && window.ethereum.selectedAddress) {
    if (statusEl) statusEl.textContent = 'Attempting auto-connect...';
    await connectWallet();
  } else {
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo) walletInfo.textContent = 'Not connected';
    if (statusEl) statusEl.textContent = 'Click "Connect Wallet" to start';
    if (detectEl) {
      detectEl.textContent = window.ethereum ? 'Wallet extension detected (not connected).' : 'No wallet extension detected.';
    }
  }
});

function displayPromises(promises) {
  recentPromisesDiv.innerHTML = '';
  allPromisesDiv.innerHTML = '';

  if (promises.length === 0) {
    const noRecent = document.createElement('p');
    noRecent.textContent = 'No promises yet.';
    noRecent.style.color = '#fff';
    recentPromisesDiv.appendChild(noRecent);

    const noAll = document.createElement('p');
    noAll.textContent = 'No promises to display.';
    noAll.style.color = '#fff';
    allPromisesDiv.appendChild(noAll);
    return;
  }

  // Convert to array and sort by timestamp (convert BigInt to number)
  const sortedPromises = [...promises].sort((a, b) => {
    const aTime = Number(a.timestamp);
    const bTime = Number(b.timestamp);
    return bTime - aTime;
  });

  sortedPromises.slice(0, 5).forEach(promise => {
    recentPromisesDiv.appendChild(createPromiseCard(promise));
  });

  sortedPromises.forEach(promise => {
    allPromisesDiv.appendChild(createPromiseCard(promise, true));
  });
}

function createPromiseCard(promise, showFulfillButton = false) {
  const card = document.createElement('div');
  card.className = 'card';

  // Convert BigInt values to regular numbers
  const timestamp = Number(promise.timestamp);
  const promiseId = Number(promise.id);

  const title = document.createElement('h3');
  title.textContent = promise.title;

  const description = document.createElement('p');
  description.textContent = promise.description;

  const creator = document.createElement('p');
  creator.textContent = 'Creator: ' + shortenAddress(promise.creator);

  const timestampEl = document.createElement('p');
  const date = new Date(timestamp * 1000);
  timestampEl.textContent = 'Created: ' + date.toLocaleString();

  const statusBadge = document.createElement('span');
  statusBadge.className = 'badge ' + (promise.fulfilled ? 'fulfilled' : 'pending');
  statusBadge.textContent = promise.fulfilled ? 'Fulfilled' : 'Pending';

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(creator);
  card.appendChild(timestampEl);
  card.appendChild(statusBadge);

  if (showFulfillButton && !promise.fulfilled) {
    const fulfillBtn = document.createElement('button');
    fulfillBtn.textContent = 'Mark as Fulfilled';
    fulfillBtn.className = 'glow';
    fulfillBtn.onclick = async () => {
        try {
        const address = await signer.getAddress();
        const bal = await provider.getBalance(address);
        console.log('Wallet balance (wei):', bal.toString());
        const tx = await contract.fulfillPromise(promiseId);
        await tx.wait();
        loadPromises();
      } catch (error) {
        alert('Error fulfilling promise: ' + (error.message || error));
      }
    };
    card.appendChild(fulfillBtn);
  }

  return card;
}

function updateStats(promises) {
  totalPromisesCard.textContent = 'Total Promises: ' + promises.length;
  const fulfilledCount = promises.filter(p => p.fulfilled).length;
  fulfilledPromisesCard.textContent = 'Fulfilled Promises: ' + fulfilledCount;
  pendingPromisesCard.textContent = 'Pending Promises: ' + (promises.length - fulfilledCount);
}

createPromiseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!contract) {
    alert('❌ Wallet not connected! Please click "Connect Wallet" first.');
    await connectWallet();
    return;
  }
  
  const title = createPromiseForm.title.value.trim();
  const description = createPromiseForm.description.value.trim();
  const category = createPromiseForm.category.value;

  if (!title || !description) {
    alert('Please fill in all fields');
    return;
  }

  try {
    console.log('Creating promise with:', { title, description, category });
    const address = await signer.getAddress();
    const bal = await provider.getBalance(address);
    console.log('Wallet balance (wei):', bal.toString());
    alert('📤 Check MetaMask window - CLICK APPROVE/CONFIRM to submit');
    const tx = await contract.createPromise(title, description, category);
    console.log('Transaction sent:', tx.hash);
    alert('⏳ Transaction being processed... Please wait...');
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    createPromiseForm.reset();
    alert('✅ Promise created successfully and stored on blockchain!');
    loadPromises();
  } catch (error) {
    console.error('Full error:', error);
    if (error.code === 'ACTION_REJECTED') {
      alert('❌ Transaction rejected by user. Click Approve in MetaMask next time.');
    } else {
      alert('Error creating promise: ' + error.message);
    }
  }
});

verifyPromiseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!contract) {
    alert('❌ Wallet not connected! Please click "Connect Wallet" first.');
    await connectWallet();
    return;
  }
  
  const id = parseInt(verifyPromiseForm.promiseId.value);
  if (isNaN(id)) {
    alert('Please enter a valid promise ID');
    return;
  }

  try {
    console.log('Fetching promise with ID:', id);
    const promise = await contract.getPromise(id);
    console.log('Promise details fetched:', promise);
    displayVerifyResult(promise);
  } catch (error) {
    console.error('Error fetching promise:', error);
    alert('❌ Promise not found or error fetching promise. Check console for details.');
  }
});

function displayVerifyResult(promise) {
  verifyResultDiv.style.display = 'block';
  // Convert BigInt values to regular numbers
  const timestamp = Number(promise.timestamp);
  const date = new Date(timestamp * 1000);
  const promiseId = Number(promise.id);
  
  verifyResultDiv.innerHTML = `
    <div style="border-left: 4px solid #00ffff; padding-left: 1rem;">
      <h3 style="color: #00ffff; margin-top: 0;">🔗 Promise #${promiseId}: ${promise.title}</h3>
      <p style="color: #9a7aff;"><strong>Description:</strong> ${promise.description}</p>
      <p style="color: #9a7aff;"><strong>Category:</strong> ${promise.category}</p>
      <p style="color: #9a7aff;"><strong>Creator:</strong> ${shortenAddress(promise.creator)}</p>
      <p style="color: #9a7aff;"><strong>Created:</strong> ${date.toLocaleString()}</p>
      <p style="color: #9a7aff;"><strong>Status:</strong> <span class="badge ${promise.fulfilled ? 'fulfilled' : 'pending'}">${promise.fulfilled ? '✓ Fulfilled' : '⏳ Pending'}</span></p>
      <p style="color: #00ff00; margin-top: 1rem; font-weight: 600;">✅ Verified on Blockchain</p>
    </div>
  `;
}

function setPromiseId(id) {
  document.getElementById('promiseId').value = id;
  document.getElementById('verifyPromiseForm').scrollIntoView({ behavior: 'smooth' });
}

connectWalletBtn.addEventListener('click', connectWallet);


