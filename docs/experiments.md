# Investigation: Content-Based Identity Determinism

This document records the experimental results for generating a consistent **Content-Based Identity** (SHA-256 hash) from remote video sources using deterministic download parameters.

## Experiment: Platform Identity Consistency

**Date:** 2026-02-12
**Environment:** Restricted yt-dlp configuration on **Stellar Testnet** prototype environment.

### Methodology

The pipeline resolves remote URLs into a canonical byte stream to ensure that identical visual content (within the same bitstream) produces the same **Verification Record** on the ledger.

```bash
yt-dlp -f "best[ext=mp4]" --no-cache-dir --no-part -o "output.mp4" <VIDEO_URL>
```

### Observations

| Test Variable | Trial A | Trial B |
|-----------|-----------|-----------|
| Resource ID | `1Eo_ojxFde0` | `1Eo_ojxFde0` |
| Stream Format | `best[ext=mp4]` | `best[ext=mp4]` |
| Byte Count | 415,919 bytes | 415,919 bytes |
| **Content-Based Identity** | `FF655EC5...BC1081` | `FF655EC5...BC1081` |
| **Integrity Match** | ✅ **Confirmed** | ✅ **Confirmed** |

### Investigation Findings

The experiment confirms that for a fixed tool version and format string, remote video downloads are byte-deterministic. This validates the **Content-Based Identity** model for the AuthentiScan prototype:
- Identity is derived from the file's hash, not its location.
- The same byte sequence will always resolve to the same **Verification Record**.
- Version locking of download tools is required for cross-client consistency.

### Prototype Constraints

| Constraint | Description |
|-----------|--------|
| **Transcoding Variance** | If a platform re-encodes a video (e.g., for different bitrates), the byte sequence changes, resulting in a new **Content-Based Identity**. |
| **Format Sensitivity** | Different containers or resolutions produce different hashes. The system identifies specific bitstreams, not semantic visual content. |
| **Tool Dependency** | Changes in the underlying downloader logic may impact the deterministic output. |

---
*© 2026 AuthentiScan — Experimental Research Prototype*
