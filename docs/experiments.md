# Investigation: Deterministic Download Feasibility

This document records early experiments to verify if remote video downloads can produce byte-identical outputs when using fixed parameters, enabling consistent hash-based identity.

## Experiment 1 — Platform Determinism (YouTube)

**Date:** 2026-02-12
**Environment:** yt-dlp (locked version)

### Testing Pipeline

The following command was used to retrieve a canonical MP4 stream:
```bash
yt-dlp -f "best[ext=mp4]" --no-cache-dir --no-part -o "output.mp4" <VIDEO_URL>
```

### Observations

| Test Parameter | Trial 1 | Trial 2 |
|-----------|-----------|-----------|
| Video ID | `1Eo_ojxFde0` | `1Eo_ojxFde0` |
| Requested Format | `best[ext=mp4]` | `best[ext=mp4]` |
| Resulting File Size | 415,919 bytes | 415,919 bytes |
| SHA-256 Fingerprint | `FF655EC5...BC1081` | `FF655EC5...BC1081` |
| **Integrity Match** | ✅ **Confirmed** | ✅ **Confirmed** |

### Investigation Conclusion

Preliminary results suggest that using a consistent tool version and explicit format selection can produce **byte-identical output** for the same remote resource. This supports the feasibility of a **hash-based identity** model for digital assets, provided that:
- `yt-dlp` versions are strictly managed.
- Format selection remains constant across different clients.
- Content caching or partial downloads are disabled.

### Known Technical Constraints

| Constraint | Description |
|-----------|--------|
| **Server-Side Re-encoding** | If the hosting platform modifies the underlying file (e.g., for transcoding), the content hash will change. This accurately reflects a change in the digital asset. |
| **Stream Variance** | Different resolutions or codecs produce different hashes. The system identifies specific byte sequences, not visual semantics. |
| **Client Divergence** | Variations in tool configuration across different environments may impact the deterministic nature of the fingerprint. |

---
*© 2026 AuthentiScan (Experimental Prototype by Tunahan Türker Ertürk)*
