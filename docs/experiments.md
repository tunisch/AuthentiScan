# Investigation: Content Hashing Determinism

This document records early research findings confirming that remote video sources can produce a consistent **SHA-256 Content Hash** (the basis for **Content-Based Identity**) under fixed parameters.

## Experiment: Platform Consistency

**Date:** 2026-02-12
**Environment:** **Stellar Testnet** experimental pipeline.

### Methodology

The pipeline resolves remote URLs into a canonical byte stream to ensure that identical visual content results in the same **Verification Record** on the ledger.

```bash
yt-dlp -f "best[ext=mp4]" --no-cache-dir --no-part -o "output.mp4" <VIDEO_URL>
```

### Observations

| Resource ID | Trial A | Trial B |
|-----------|-----------|-----------|
| yt: `1Eo_ojxFde0` | 415,919 bytes | 415,919 bytes |
| Format Target | `best[ext=mp4]` | `best[ext=mp4]` |
| **SHA-256 Content Hash** | `FF655EC5...BC1081` | `FF655EC5...BC1081` |
| **Identity Match** | ✅ **Confirmed** | ✅ **Confirmed** |

### Findings

Preliminary data confirms that for a fixed tool version and format selection, remote video downloads produce byte-identical output. This validates the **Content-Based Identity** model for the AuthentiScan prototype:
- Identity is derived from the **SHA-256 Content Hash** of the file's bytes.
- The same byte sequence will always resolve to the same **Verification Record**.
- Version locking of download tools ensures cross-client consistency.

### Prototype Constraints

| Constraint | Reason | Impact |
|-----------|-----------|--------|
| **Server-Side Transcoding** | Platforms may modify underlying files over time for optimization. | Content hashes will change, accurately reflecting a modified digital asset. |
| **Format Variations** | Different storage formats or resolutions result in different bitstreams. | Each format represents a unique **Verification Record**. |
| **Library Dependencies** | Changes in extraction tools can affect deterministic byte output. | Version pinning is required for environment consistency. |

---
*© 2026 AuthentiScan — Experimental Research Prototype*
