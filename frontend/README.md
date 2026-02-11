# 🖥️ AuthentiScan: Trust Infrastructure Frontend

The high-performance, investor-ready user interface for the AuthentiScan platform. Built on **Next.js 14**, it provides a seamless bridge between AI forensics and blockchain anchoring.

## 🚀 High-End Features

- **AI Lab Visualizations:** Circular confidence meters, frame-by-frame heatmap grids, and audio spectrogram simulations.
- **Immutable Ledger Integration:** Full-cycle interaction with Stellar Soroban contracts via the Stellar SDK and Freighter Wallet.
- **Trust Telemetry:** Real-time transaction state tracking (Signing → Broadcasting → Confirming) with integrated block explorer links.
- **GPU-Accelerated UX:** Cinematic dark mode with 60fps glassmorphism animations and responsive layout architecture.

---

## 🛠️ Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Engine:** React & TypeScript
- **Styling:** Premium Vanilla CSS (GPU optimized)
- **SDK:** `@stellar/stellar-sdk` & `@stellar/freighter-api`
- **Security:** In-browser SHA-256 hashing via `crypto.subtle`

---

## 🏛️ Local Environment

### 1. Configuration
Create a `.env.local` file in the root of the `/frontend` directory:
```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_SOROBAN_CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### 2. Development
```bash
# Install dependencies
npm install

# Launch dev server
npm run dev
```

---

## 🧪 Validation Suite

The frontend includes a rigorous test suite to ensure the integrity of cryptographic operations and UI state transitions.

```bash
# Run validation scripts
node tests/validate.mjs
```

**Key Areas Tested:**
- **Hashing Determinism:** Verified SHA-256 consistency against known vectors.
- **Workflow Integrity:** Validated state transitions from file receipt to ledger confirmation.
- **Simulation Accuracy:** Confirmed AI mock engine heuristic alignment.
- **Stellar SDK Connectivity:** Validated RPC and Contract interaction patterns.

---

## 🛡️ Trust Infrastructure Integrity

AuthentiScan is designed to prioritize **epistemic safety**. 
- **Privacy:** Video data never leaves the client; only fingerprints are submitted.
- **Transparency:** All blockchain transactions provide direct links to independent explorers for verification.
- **Governance:** Integrated forensic warnings and technical disclosure panels ensure responsible reporting.

---
© 2026 AuthentiScan Lab. Decoding reality, one block at a time.
