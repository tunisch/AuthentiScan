# 📜 AuthentiScan: Soroban Smart Contract

The core logic of the AuthentiScan platform, implemented as a secure, persistent smart contract on the Stellar network.

## 🏛️ Architecture

This contract is written in **Rust** using the **Soroban SDK**. It serves as an immutable truth repository for video verification records.

### Persistence Strategy
- **Type:** Persistent Storage (Instance & Metadata)
- **Composite Keys:** Records are keyed by a combination of `Video Hash` + `Submitter Address`, ensuring data integrity and uniqueness per auditor.
- **Auto-Incrementing Global Buffer:** A `VerificationCount` is maintained to support efficient global audit indexing and statistical reporting.

### Data Model
```rust
pub struct VerificationRecord {
    pub video_hash: BytesN<32>,      // SHA-256 fingerprint
    pub submitter: Address,           // Verified auditor address
    pub is_ai_generated: boolean,     // AI Engine verdict
    pub confidence_score: u32,        // Probability index (0-100)
    pub timestamp: u64,               // Ledger anchor time
}
```

---

## 🛠️ Interface (Public Functions)

### `submit_verification`
Anchors a forensic verdict to the ledger.
- **Auth:** Requires submitter signature (`submitter.require_auth()`).
- **Validation:** Enforces constraints on confidence scores and prevents duplicate anchors for the same video/auditor pair.

### `get_verification`
Retrieves an immutable proof record from the ledger using the video's cryptographic fingerprint.

### `get_verification_count`
Provides real-time statistics on the total number of verifications anchored to the network.

---

## 🧪 Testing & Validation

The contract environment includes a comprehensive test suite covering edge cases, authorization logic, and state transitions.

```bash
# Execute forensic contract tests
cargo test
```

**Test Coverage:**
- ✅ **Deterministic Retrieval:** Verified lookups for existing records.
- ✅ **Unauthorized Access Prevention:** Validated `require_auth` enforcement.
- ✅ **Boundary Enforcement:** Restricted confidence scores to the [0, 100] range.
- ✅ **Duplicate Rejection:** Ensured hash/auditor uniqueness on-chain.

---

## 🏗️ Build & Deploy

```bash
# Compile to optimized WebAssembly
stellar contract build

# Deploy to Stellar Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/video_verification.wasm \
  --source deployer \
  --network testnet
```

---
© 2026 AuthentiScan Lab. Forensic-grade permanence via Soroban.
