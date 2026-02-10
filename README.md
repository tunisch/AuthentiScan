# Video Verification dApp

A decentralized application that verifies video authenticity and stores the result on the Stellar blockchain. Users upload a video, the app computes a SHA-256 hash, runs AI analysis, and records the verification on-chain. Anyone can query the blockchain to check if a video has been verified.

There is no backend server. The frontend talks directly to the blockchain.

```
Frontend (React/TypeScript) → Freighter Wallet → Stellar Testnet (Soroban Smart Contract)
```

---

## Prerequisites

You need the following installed before starting:

| Tool | Why |
|------|-----|
| **Node.js** (v18+) | Runs the frontend dev server |
| **npm** | Installs frontend dependencies |
| **Rust** | Compiles the smart contract to WebAssembly |
| **Stellar CLI** | Deploys and interacts with the contract on Testnet |
| **Freighter Wallet** | Browser extension that signs blockchain transactions |
| **Git** | Clones the repository |

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd block_chain_project
```

The project has two main folders:

```
block_chain_project/
├── contract/       # Soroban smart contract (Rust)
└── frontend/       # Next.js frontend (TypeScript)
```

---

## 2. Smart Contract Setup

### 2.1 Install Rust

Rust is needed to compile the smart contract. Install it from [rustup.rs](https://rustup.rs):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, add the WebAssembly target. Soroban contracts compile to WASM:

```bash
rustup target add wasm32-unknown-unknown
```

### 2.2 Install Stellar CLI

The Stellar CLI lets you deploy contracts and interact with the Testnet:

```bash
cargo install --locked stellar-cli --features opt
```

Verify it installed:

```bash
stellar --version
```

### 2.3 Configure Testnet

Tell the CLI to use Stellar Testnet:

```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 2.4 Create a Deployer Identity

This creates a keypair that will deploy the contract. It also funds the account with test tokens:

```bash
stellar keys generate deployer --network testnet --fund
```

Check that it was created:

```bash
stellar keys address deployer
```

### 2.5 Build the Contract

Navigate to the contract folder and compile:

```bash
cd contract
stellar contract build
```

This produces a `.wasm` file in `target/wasm32-unknown-unknown/release/`.

### 2.6 Deploy the Contract

Deploy to Testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/video_verification.wasm \
  --source deployer \
  --network testnet
```

This outputs a **Contract ID** — a 56-character string starting with `C`. Copy it. You will need it in the next section.

Example output:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2QLGN7V2
```

**Save this Contract ID.** You cannot recover it later without checking the transaction history.

---

## 3. Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Create Environment File

Create a file called `.env.local` in the `frontend/` folder:

```bash
# frontend/.env.local

NEXT_PUBLIC_CONTRACT_ID=PASTE_YOUR_CONTRACT_ID_HERE
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

Replace `PASTE_YOUR_CONTRACT_ID_HERE` with the Contract ID from step 2.6.

### 3.3 Install Freighter Wallet

1. Go to [freighter.app](https://www.freighter.app/) and install the browser extension
2. Create a wallet or import an existing one
3. **Switch the network to Testnet** (Settings → Network → Testnet)
4. Fund your wallet with test tokens at [friendbot](https://friendbot.stellar.org/?addr=YOUR_ADDRESS)

---

## 4. Running the Application

Start the development server:

```bash
cd frontend
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

Make sure:
- Freighter is installed and unlocked
- Freighter is set to **Testnet**
- Your wallet has test tokens (use friendbot if needed)

---

## 5. How to Use the App

### Step 1: Connect Wallet

Click **Connect** in the wallet section. Freighter will ask you to approve access. After connecting, your wallet address and network will appear.

### Step 2: Upload a Video

Click the file input and select a video file (MP4, MOV, AVI). The app will:
- Validate the file type and size (max 50MB)
- Compute the SHA-256 hash of the video content
- Run a simulated AI analysis to classify whether the video is AI-generated

This all happens in your browser. The video never leaves your device.

### Step 3: Submit to Blockchain

Click **Submit Verification to Blockchain**. Behind the scenes:
1. The app builds a Soroban transaction with your hash and analysis results
2. It simulates the transaction to estimate costs
3. Freighter pops up asking you to approve and sign
4. The signed transaction is submitted to Stellar Testnet
5. The app waits for the transaction to be confirmed

After confirmation, you'll see a transaction hash with a link to [Stellar Expert](https://stellar.expert) where you can independently verify it.

### Step 4: Query On-Chain Data

After submission, the app automatically reads the data back from the blockchain and displays it in a proof table showing:
- Video hash
- Submitter address
- AI classification result
- Confidence score
- Timestamp
- Network

You can also click **Read Verification from Blockchain** at any time to manually query.

---

## 6. Running Tests

### Smart Contract Tests

Make sure Rust is installed, then:

```bash
cd contract
cargo test
```

This runs 9 unit tests covering:
- Valid submission and retrieval
- Duplicate rejection
- Invalid confidence score
- Boundary values (0 and 100 pass, 101 fails)
- Non-existent record returns None
- Multiple submitters on same hash
- Counter increment correctness

### Frontend Tests

```bash
cd frontend
node tests/validate.mjs
```

This runs 28 tests covering:
- SHA-256 hashing (determinism, known vectors, uniqueness)
- AI mock scoring (range validation, formula correctness)
- Config validation (RPC URL, Contract ID format)
- Transaction polling logic
- File validation rules (type, size)
- UI edge cases (truncation, null handling)

---

## 7. Common Problems & Fixes

### "Freighter wallet not detected"

Freighter is not installed or not enabled for this site.

**Fix**: Install Freighter from [freighter.app](https://www.freighter.app/). Make sure it's enabled for localhost in extension settings.

### "Simulation failed" on submission

Usually means one of:
- Wrong network (wallet is on Mainnet, app expects Testnet)
- Duplicate submission (you already verified this video)
- Contract ID is wrong

**Fix**: Check that Freighter is on **Testnet**. Check that `.env.local` has the correct Contract ID. Try a different video file.

### "CONTRACT_ID is not set"

The environment variable is missing.

**Fix**: Create `frontend/.env.local` with your Contract ID. Restart the dev server after changing `.env.local`.

### "Could not get wallet address"

Freighter denied access or timed out.

**Fix**: Click the Freighter icon, unlock your wallet, then try connecting again.

### Transaction stuck on "Submitting..."

The RPC endpoint might be slow or unreachable.

**Fix**: Wait up to 30 seconds. If it doesn't resolve, check your internet connection. The Stellar Testnet RPC occasionally has delays.

---

## 8. Project Status

| Item | Status |
|------|--------|
| Smart contract | ✅ Complete (9 tests) |
| Frontend | ✅ Complete (28 tests) |
| TypeScript compilation | ✅ 0 errors |
| Testnet deployment | ✅ Ready |
| Wallet integration | ✅ Working |
| On-chain read/write | ✅ Working |
| Academic documentation | ✅ Complete |

The project is fully functional and ready for demo or further development.
