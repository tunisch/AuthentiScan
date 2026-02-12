# Video Verification Smart Contract

Soroban smart contract for anchoring video authenticity analysis results to the Stellar blockchain.

## Network

- **Chain:** Stellar Testnet
- **Language:** Rust → WASM (Soroban SDK)
- **Storage:** Persistent (TTL-managed)

## On-Chain Record Structure

```rust
pub struct VerificationRecord {
    pub record_id: u32,               // Unique Record ID
    pub video_hash: BytesN<32>,       // Video SHA-256 hash (content identity)
    pub submitter: Address,           // Submitter wallet address
    pub is_ai_generated: bool,        // AI analysis verdict
    pub confidence_score: u32,        // Confidence score (0-100)
    pub timestamp: u64,               // Ledger timestamp
}
```

## Contract Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `submit_verification` | `submitter, video_hash, is_ai_generated, confidence_score` | Anchor analysis result to ledger |
| `get_verification` | `video_hash, submitter` | Query existing record by content hash |
| `get_verification_count` | — | Total number of anchored records |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1 | `InvalidConfidence` | Confidence score must be 0-100 |
| 2 | `AlreadyVerified` | Video hash already registered (immutability protection) |
| 3 | `Unauthorized` | Caller is not authorized |
| 4 | `NotFound` | Verification record not found |
| 5 | `InvalidHash` | Video hash is invalid |

## Guarantees

- **Write-once:** No `update` or `delete` functions exist
- **Duplicate prevention:** Re-submitting the same hash returns existing `record_id`
- **Cryptographic auth:** Every submission requires wallet signature (`require_auth`)
- **Immutability:** Records cannot be modified after anchoring

## Build & Deploy

```bash
# Build
stellar contract build

# Add testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate deployer wallet
stellar keys generate deployer --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/video_verification.wasm \
  --source deployer \
  --network testnet
```

Save the returned **Contract ID** for frontend `.env.local`.

## Storage Keys

```rust
pub enum DataKey {
    Verification(BytesN<32>),  // Per-video record
    VerificationCount,         // Global counter
}
```
