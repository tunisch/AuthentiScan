# Video Verification dApp - Frontend

Next.js 14 frontend for AI video verification on Stellar blockchain.

## Status

✅ **Phase 1 Complete: UI Flow (No Wallet/Blockchain)**

- Video upload and hash calculation
- Mock AI analysis
- UI components with minimalist design
- Ready for Freighter integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Freighter (next phase)
- **Blockchain**: Stellar Testnet (next phase)

## Project Structure

```
frontend/
├── app/
│   └── page.tsx              # Main page
├── components/
│   ├── WalletConnect.tsx     # Placeholder (no wallet yet)
│   ├── VideoUpload.tsx       # Video selection & hash
│   ├── AnalysisResult.tsx    # Display AI result
│   └── SubmitVerification.tsx # Mock blockchain submit
├── lib/
│   ├── hash.ts               # SHA-256 video hashing
│   └── mockAi.ts             # Fake AI analysis
```

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Features

### ✅ Implemented
- Video file upload (MP4, MOV, AVI)
- SHA-256 hash calculation
- Mock AI analysis (heuristic-based)
- Analysis result display
- Mock blockchain submission

### ❌ Not Yet Implemented (By Design)
- Freighter wallet connection
- Real blockchain interaction
- Contract invocation
- Transaction signing

## User Flow

1. User uploads video file
2. System calculates SHA-256 hash
3. Mock AI analyzes video (simulated)
4. Results displayed (AI-generated? Confidence score)
5. User clicks "Submit" (console.log for now)

## Next Phase

- Freighter wallet integration
- Stellar SDK setup
- Contract interaction layer
- Real blockchain submission

## Design Philosophy

Minimalist, brutalist design:
- Black borders
- White backgrounds
- Monospace fonts
- No unnecessary styling
- Focus on functionality

---

**Current Status**: Frontend skeleton complete, ready for wallet integration.
