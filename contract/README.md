# AuthentiScan: Prototype Smart Contract

This Soroban smart contract is an **experimental prototype** designed to anchor **Verification Records** for video content to the **Stellar Testnet**.

## Infrastructure Status

- **Network:** Stellar Testnet
- **Environment:** Soroban (Rust SDK)
- **Status:** Functional Prototype (Not Audited)

## On-Chain Data Model

The contract stores the following structure for each **Verification Record**:

```rust
pub struct VerificationRecord {
    pub record_id: u32,               // Autoincrementing unique ID
    pub video_hash: BytesN<32>,       // Content-Based Identity (SHA-256)
    pub submitter: Address,           // Submitting wallet address
    pub is_ai_generated: bool,        // Result from Prototype AI Analysis
    pub confidence_score: u32,        // Probabilistic confidence (0-100)
    pub timestamp: u64,               // Approximate ledger time
}
```

## Contract API

| Function | Parameters | Description |
|----------|-----------|-------------|
| `submit_verification` | `submitter, video_hash, is_ai_generated, confidence_score` | Anchor a new **Verification Record** to the ledger |
| `get_verification` | `video_hash` | Retrieve a record using its **Content-Based Identity** |
| `get_verification_count` | — | Total records anchored in this prototype instance |

## Technical Properties

- **Write-Once Immutability:** The contract logic explicitly forbids the update or deletion of existing **Verification Records**.
- **Unique Content Mapping:** The `video_hash` serves as a unique lookup key, preventing duplicate records for identical content.
- **Cryptographic Authorization:** All submission transactions are enforced via the `require_auth` pattern, ensuring the `submitter` address authorized the entry.

---

## Build & Demo Deployment

### 1. Build WASM
```bash
stellar contract build
```

### 2. Configure Testnet Identity
```bash
# Add Stellar Testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Setup keys
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
