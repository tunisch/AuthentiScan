# 48-Hour Maintenance & Hardening Plan (Post-Audit)

Follow this immediate action plan to finalize the production hardening of AuthentiScan.

---

## Phase 1: Visual Proof (First 4 Hours)
*   **Action:** Replace current placeholder screenshot links in `README.md` with actual application captures.
*   **Goal:** Provide visual evidence of the working platform to investors and auditors.
*   **Method:** Use the browser tool or manual capture of the locally running frontend.

## Phase 2: Onboarding Stress Test (First 24 Hours)
*   **Action:** Perform a "Clean Environment" deployment test.
*   **Goal:** Verify that the `Quick Start` instructions are 100% accurate.
*   **Checklist:**
    - [ ] Clone to a fresh directory.
    - [ ] Run prerequisites check commands.
    - [ ] Deploy contract to testnet.
    - [ ] Launch frontend.
    - [ ] Verify first video anchor.

## Phase 3: Defensive Review (First 48 Hours)
*   **Action:** "Red Team" audit of `SECURITY.md`.
*   **Goal:** Ensure all listed limitations and security properties are accurately represented in the code.
*   **Focus:** Verify that `require_auth` in `contract/src/lib.rs` matches the "Submission Authorization" claim in the security doc.

---

## Long-term Roadmap
1.  **Mainnet Migration:** Prepare fresh keys and security audit.
2.  **AI Oracle:** Transition from demo forensic engine to decentralized AI oracles.
3.  **Semantic Matching:** Research perceptional hashing (pHash) to catch visually similar but byte-different re-encodes.
