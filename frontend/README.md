# AuthentiScan: Prototype UI

This is the experimental frontend for the AuthentiScan project. Built on **Next.js 14**, it provides an interface to demonstrate the lifecycle of a **Verification Record** on the **Stellar Testnet**.

## Prototype Highlights

- **Verification Visuals:** Prototype confidence indicators and frame-analysis grids that visualize **Prototype AI Analysis** data.
- **Ledger Connectivity:** Integration with Soroban contracts using the Stellar SDK and Freighter Wallet.
- **Transaction Telemetry:** Basic tracking of ledger state transitions (Signing → Broadcasting → Confirming).
- **Responsive Theme:** Modern dark-themed interface designed for demonstration and research.

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Engine:** React & TypeScript
- **Styling:** Vanilla CSS (Responsive Layouts)
- **SDK:** `@stellar/stellar-sdk` & `@stellar/freighter-api`
- **Identity Logic:** Client-side **Content-Based Identity** generation via `crypto.subtle` (SHA-256).

---

## Local Setup

### 1. Configuration
Create a `.env.local` file in the `/frontend` directory:
```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_TESTNET_CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### 2. Run Development Server
```bash
npm install
npm run dev
```

---

## Validation Procedures

The frontend includes a set of validation scripts to verify the consistency of cryptographic operations and state transitions.

```bash
# Run validation scripts
node tests/validate.mjs
```

**Areas Covered:**
- **Identity Determinism:** Verifying that **Content-Based Identity** (SHA-256) is consistent.
- **Workflow Integrity:** Validating the state machine from file ingest to ledger confirmation.
- **Simulation Accuracy:** Ensuring UI components correctly reflect **Prototype AI Analysis** (mock) data.

---

## Project Disclosures

- **Data Privacy**: No raw video content leaves the browser. Only the SHA-256 hash is transmitted to the network.
- **Simulation Notice**: The AI forensic analysis indicators are currently part of a **Prototype AI Analysis** module and do not reflect real-time forensic detection.
- **Stellar Testnet**: This interface is configured specifically for experimentation on the **Stellar Testnet**.

---
*© 2026 AuthentiScan — Experimental Research Prototype*
