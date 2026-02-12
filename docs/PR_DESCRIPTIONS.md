# Professional PR Descriptions

Use these templates when submitting pull requests for documentation hardening.

---

## PR A: README Cleanup & Documentation Layering

**Title:** `docs: restructure README and decentralize technical specs`

### Description
This PR transitions the project to a "layered documentation" model. The main README is now focused on the value proposition and quick onboarding, while technical details have been moved to specialized files.

### Changes
- ✅ **README.md:** Reduced from 346 to ~150 lines. Focus on Features, Quick Start, and Architecture.
- ✅ **docs/experiments.md:** Created to store byte-level verification data and download pipeline tests.
- ✅ **contract/README.md:** Moved full Soroban API, Rust structs, and deployment guides here.
- ✅ **SECURITY.md:** Centralized the trust model, security properties, and known limitations.

### Rationale
Increases accessibility for new developers while maintaining high-fidelity documentation for auditors.

---

## PR B: Add/Improve SECURITY.md & Threat Model

**Title:** `docs: harden security documentation and threat model`

### Description
Formalizes the security architecture and threat model of the AuthentiScan platform.

### Changes
- 🛡️ **Trust Architecture:** Added Mermaid diagram showing Untrusted vs. Immutable zones.
- 🔐 **Key Rotation:** Added mandatory policies for Testnet to Mainnet migration.
- 📋 **Security Properties:** Documented content integrity, record immutability, and duplicate prevention mechanisms.
- ⚠️ **Limitations Disclosure:** Clearly listed AI probabilistic nature and format sensitivity.

### Rationale
Ensures the project meets production standards for security-sensitive blockchain applications.
