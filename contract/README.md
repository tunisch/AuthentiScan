# AuthentiScan: Prototype Smart Contract

A Soroban smart contract for anchoring video authenticity analysis results to the Stellar blockchain. This contract is an **experimental prototype** intended for research and demonstration.

## Deployment Context

- **Network:** Stellar Testnet
- **Environment:** Soroban (Rust SDK)
- **Status:** Functional Prototype

## On-Chain Record Structure

```rust
pub struct VerificationRecord {
    pub record_id: u32,               // Autoincrementing record ID
    pub video_hash: BytesN<32>,       // SHA-256 fingerprint of video content
    pub submitter: Address,           // Address of the submitting wallet
    pub is_ai_generated: bool,        // Result from the prototype analysis module
    pub confidence_score: u32,        // Probabilistic confidence (0-100)
    pub timestamp: u64,               // Ledger time (approximate)
}
```

## Contract API

| Function | Parameters | Description |
|----------|-----------|-------------|
| `submit_verification` | `submitter, video_hash, is_ai_generated, confidence_score` | Anchor a verification result to the ledger |
| `get_verification` | `video_hash` | Retrieve an existing record by content hash |
| `get_verification_count` | — | Get total count of anchored records |

## Technical Properties

- **Immutability:** The contract is designed with no update or delete functions. Once a record is written, it remains on the ledger.
- **Verification Integrity:** The contract uses the `video_hash` as a unique identifier to prevent duplicate entries for the same content.
- **Auth Enforcement:** Submissions utilize the `require_auth` pattern, ensuring transactions are authorized by the `submitter` address.

---

## Build & Deployment (Testnet)

### 1. Build
```bash
stellar contract build
```

### 2. Network Configuration
```bash
# Add Testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Setup deployer
stellar keys generate deployer --network testnet --fund
```

### 3. Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/video_verification.wasm \
  --source deployer \
  --network testnet
```

---

## Disclosures & Limitations

- **Experimental Code:** This contract has not undergone a professional security audit and should not be used in production environments.
- **Testnet Only:** Deployment on Mainnet requires significant hardening, including formal verification and robust administrative controls.
- **Data Persistence:** Persistent storage on Soroban involves TTL-managed state; ensure you understand the rent logic before scaling deployments.

---
*© 2026 AuthentiScan (Experimental Prototype by Tunahan Türker Ertürk)*
