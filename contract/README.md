# Video Verification Smart Contract (Soroban)

A Stellar Soroban smart contract for storing immutable video verification records on-chain.

## Overview

This contract enables users to submit AI-generated video verification results to the blockchain, creating a transparent and tamper-proof audit trail for video authenticity.

## Architecture

### Storage Design

**Persistent Storage** (long-term, survives contract upgrades):
- Individual verification records (composite key: video_hash + submitter)
- Global verification count

**TTL (Time To Live)**: 1 year (~6.3M ledgers)

### Data Structures

```rust
struct VerificationRecord {
    video_hash: BytesN<32>,      // SHA-256 hash of video
    submitter: Address,           // Wallet that submitted
    is_ai_generated: bool,        // AI analysis result
    confidence_score: u32,        // 0-100 percentage
    timestamp: u64,               // Ledger timestamp
}
```

## Contract Functions

### Write Functions

#### `submit_verification`
Submit a new video verification result.

**Parameters:**
- `submitter: Address` - Wallet address (must sign transaction)
- `video_hash: BytesN<32>` - SHA-256 hash of video
- `is_ai_generated: bool` - AI analysis result
- `confidence_score: u32` - Confidence percentage (0-100)

**Authentication:** Requires `submitter.require_auth()`

**Errors:**
- `InvalidConfidence` - Score > 100
- `DuplicateVerification` - Hash already verified by this user
- `Unauthorized` - Authentication failed

#### `update_verification`
Update confidence score of existing verification.

**Parameters:**
- `submitter: Address` - Original submitter (must sign)
- `video_hash: BytesN<32>` - Hash to update
- `new_confidence: u32` - New score (0-100)

**Authentication:** Requires `submitter.require_auth()`

**Errors:**
- `NotFound` - Verification doesn't exist
- `InvalidConfidence` - Score > 100
- `Unauthorized` - Authentication failed

### Read Functions

#### `get_verification`
Retrieve a specific verification record.

**Parameters:**
- `video_hash: BytesN<32>` - Video hash to query
- `submitter: Address` - Submitter address

**Returns:** `Option<VerificationRecord>`

#### `get_verification_count`
Get total number of verifications.

**Returns:** `u32`

#### `get_verifications_by_submitter`
Get all verifications by a specific submitter (paginated).

**Parameters:**
- `submitter: Address` - Address to query
- `start: u32` - Starting index
- `limit: u32` - Max results

**Returns:** `Vec<VerificationRecord>`

**Note:** Current implementation returns empty vector. For production, implement event-based indexing or maintain submitter -> hash mappings.

## Building

```bash
# Build optimized WASM
stellar contract build

# Optimize WASM size
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/video_verification.wasm
```

## Testing

```bash
# Run unit tests
cargo test

# Run with output
cargo test -- --nocapture
```

## Deployment

See main project README for deployment instructions.

## Security Features

- **Authentication**: All write operations require wallet signature
- **Duplicate Prevention**: Composite key (hash + submitter) prevents re-submission
- **Data Integrity**: Immutable records with timestamps
- **Access Control**: Only submitter can update their verifications

## Storage Costs

- Per verification: ~200 bytes
- TTL: 1 year (renewable)
- Estimated cost: Minimal on testnet (free), ~0.0001 XLM on mainnet

## Limitations (Academic MVP)

- `get_verifications_by_submitter` requires client-side tracking or event indexing
- No built-in pagination index (would require additional storage structure)
- No dispute/challenge mechanism (future enhancement)

## License

MIT
