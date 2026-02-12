# AuthentiScan: Prototype Hardening Roadmap

This document outlines the current state of the AuthentiScan **experimental prototype** and provides a roadmap for future development, refinement, and potential transition to production status.

## Current Prototype Status

The project currently demonstrates a functional pipeline for anchoring video findings to the **Stellar Testnet**. The core logic for **Content-Based Identity** is implemented, while analytical modules remain in a simulated state for research purposes.

### Technical Achievements (Prototype Phase)
- **SHA-256 Content Hash Identity:** Successfully implemented local hashing to identify videos by content rather than URI.
- **Stellar Testnet Anchoring:** Developed a Soroban smart contract to store **Verification Records** immutably.
- **Prototype AI Analysis Module:** Demonstrated the intended user workflow with a simulated forensic indicator.
- **Verified Submissions:** Enforced `require_auth` in the contract to ensure records are signed by the submitter's wallet.
- **Privacy Core:** Only fingerprints reach the ledger; raw video data remains in the user's local environment.

---

## Technical Properties

| Property | Mechanism | Purpose |
|----------|-----------|---------|
| **Immutability** | Stellar Ledger | Ensures anchored records cannot be modified or deleted. |
| **Uniqueness** | Hash-Based Keying | Prevents duplicate records for the same **Content-Based Identity**. |
| **Integrity** | SHA-256 Fingerprinting | Guarantees that the anchored identity matches the specific bitstream. |

---

## Roadmap: Planned Refinements

The following features and hardening steps are identified as **future-state enhancements**.

### 1. Forensic Engine Integration (Planned)
- [ ] Transition from **Prototype AI Analysis Module** (simulated) to production-grade deepfake detection models.
- [ ] Implement secure off-chain or browser-based inferencing.

### 2. Mainnet Migration & Hardening (Planned)
- [ ] **Professional Audit:** Conduct a third-party security audit of the Soroban Rust contract and Next.js data handling.
- [ ] **Key Management:** Implement secure vault solutions for mainnet account handling.
- [ ] **Network Scaling:** Validate ledger interaction performance under high concurrent submission load.

### 3. Advanced Identity Features (Planned)
- [ ] **Semantic Similarity:** Research perceptual hashing (pHash) to identify visually identical content with different encodings/hashes.
- [ ] **Batched Anchoring:** Optimize transaction costs for high-volume content creators.

---

## Disclosures & Limitations

- **Experimental Code:** This software is a research prototype and has not undergone a security audit.
- **Testnet restricted:** All transactions occur on the **Stellar Testnet** using experimental accounts.
- **No Legal Proof:** Results from this prototype are for demonstration and do not constitute legal evidence of authenticity.
- **Bitstream sensitivity:** Any change to the video file (re-encode, metadata wipe) will result in a new **SHA-256 Content Hash**.

---
*© 2026 AuthentiScan — Experimental Research Prototype*
