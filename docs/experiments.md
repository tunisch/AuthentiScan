# Deterministic Download Experiments

This document records controlled experiments verifying that remote video downloads produce byte-identical outputs when using fixed parameters.

## Experiment 1 — YouTube Shorts Determinism

**Date:** 2026-02-12
**Tool:** yt-dlp (version-locked)

### Pipeline

```
yt-dlp -f "best[ext=mp4]" --no-cache-dir --no-part -o "output.mp4" <VIDEO_URL>
```

### Results

| Parameter | Download 1 | Download 2 |
|-----------|-----------|-----------|
| Video ID | `1Eo_ojxFde0` | `1Eo_ojxFde0` |
| Format | `best[ext=mp4]` | `best[ext=mp4]` |
| File Size | 415,919 bytes | 415,919 bytes |
| SHA-256 | `FF655EC5...BC1081` | `FF655EC5...BC1081` |
| **Match** | ✅ **Identical** | ✅ **Identical** |

### Conclusion

Same video ID + same format selection + same tool version = **byte-identical output** = **identical SHA-256 hash**.

This validates the feasibility of content-based identity for remotely sourced videos, provided:
- `yt-dlp` version is locked
- Format selection is explicit (`best[ext=mp4]`)
- Caching is disabled (`--no-cache-dir --no-part`)

### Known Limitations

| Limitation | Impact |
|-----------|--------|
| Platform re-encoding | If a platform changes its video encoding, the same visual content will produce a different hash. This is correct behavior; the system identifies byte content, not visual similarity. |
| Format sensitivity | Different download formats (720p vs 1080p) produce different hashes. Each format is a different byte sequence. |
| Tool version dependency | A `yt-dlp` update could change download behavior. Version locking is mandatory. |
