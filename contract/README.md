# AuthentiScan: Prototype Smart Contract

This Soroban contract is an **experimental prototype** designed for anchoring **Verification Records** for video content to the **Stellar Testnet**.

## Prototype Status

- **Network:** Stellar Testnet
- **Environment:** Soroban (Rust SDK)
- **Status:** Functional Research Prototype (Not Audited)

## On-Chain Record Structure

The contract stores the following data structure for each **Verification Record**:

```rust
pub struct VerificationRecord {
    pub record_id: u32,               // Sequence ID for this experiment
    pub video_hash: BytesN<32>,       // SHA-256 Content Hash (Identity)
    pub submitter: Address,           // Address of the authorized submitter
    pub is_ai_generated: bool,        // Result from Prototype AI Analysis
    pub confidence_score: u32,        // Probabilistic confidence metric (0-100)
    pub timestamp: u64,               // Approximate ledger time
}
```

## Contract API

| Function | Parameters | Description |
|----------|-----------|-------------|
| `submit_verification` | `submitter, video_hash, is_ai_generated, confidence_score` | Anchor a new **Verification Record** |
| `get_verification` | `video_hash` | Query a record by its **SHA-256 Content Hash** |
| `get_verification_count` | — | Total records anchored in this prototype |

## Technical Properties

- **Write-Once Immutability:** The logic explicitly forbids the update or deletion of existing **Verification Records**.
- **Unique Keying:** The **SHA-256 Content Hash** serves as the unique identifier, preventing duplicate records for identical content.
- **Cryptographic Auth:** Submissions are enforced via the `require_auth` pattern, ensuring transaction authorization.

---

## Build & Demo Deployment

### 1. Build WASM
```bash
stellar contract build
```

### 2. Configure Testnet Network
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
