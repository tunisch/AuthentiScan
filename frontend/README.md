# AuthentiScan: Prototype Frontend

An experimental user interface for the AuthentiScan project. Built with **Next.js 14**, this frontend demonstrates the interaction between video content hashing and Stellar Soroban smart contracts.

## Key Interface Elements

- **Verification Visuals:** Prototype confidence meters and frame-by-frame analysis grids.
- **Ledger Integration:** Demonstration-ready interaction with Soroban contracts utilizing the Stellar SDK and Freighter Wallet.
- **Workflow Tracking:** Basic transaction state monitoring (Signing → Broadcasting → Confirming).
- **Responsive Theme:** Modern dark-themed interface built with Vanilla CSS and React.

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Engine:** React & TypeScript
- **Styling:** CSS-in-JS & Vanilla CSS
- **SDK Integration:** `@stellar/stellar-sdk` & `@stellar/freighter-api`
- **Client-Side Hashing:** In-browser SHA-256 via the Web Crypto API (`crypto.subtle`)

---

## Local Development

### 1. Configuration
Create a `.env.local` file in the `/frontend` directory:
```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_TESTNET_CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### 2. Setup
```bash
# Install dependencies
npm install

# Launch development server
npm run dev
```

---

## Validation Procedures

The frontend includes basic validation scripts to verify hashing consistency and UI state logic during development.

```bash
# Run validation scripts
node tests/validate.mjs
```

**Testing Focus:**
- **Hash Consistency:** Verifying that the same file produces identical SHA-256 results.
- **UI State Map:** Ensuring the "Ingest → Analyze → Anchor → Verify" progression logic is sound.
- **Mock Alignment:** Confirming UI outputs correctly reflect simulated forensic analysis data.

---

## Project Disclosures

- **Privacy:** Video data is processed locally in the browser; only the content hash is submitted to the network.
- **Transparency:** The interface provides links to public Stellar Explorers for independent verification of on-chain records.
- **Experimental Status:** The AI forensic module and "Industrial" aesthetic elements are currently prototypes intended for research and demonstration.

---
*© 2026 AuthentiScan (Experimental Prototype by Tunahan Türker Ertürk)*
