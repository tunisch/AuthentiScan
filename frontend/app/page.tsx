'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import VideoUpload from '@/components/VideoUpload';
import AnalysisResult from '@/components/AnalysisResult';
import SubmitVerification from '@/components/SubmitVerification';
import VerificationQuery from '@/components/VerificationQuery';
import { useWallet } from '@/lib/useWallet';

export default function Home() {
  const [videoHash, setVideoHash] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const wallet = useWallet();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold uppercase">Video Verification dApp</h1>

        <WalletConnectInline wallet={wallet} />

        <VideoUpload
          onHashed={(hash) => setVideoHash(hash)}
          onAnalyzed={(result) => setAnalysis(result)}
        />

        {analysis && (
          <AnalysisResult analysis={analysis} videoHash={videoHash!} />
        )}

        {analysis && videoHash && (
          <SubmitVerification
            analysis={analysis}
            videoHash={videoHash}
            walletAddress={wallet.address}
            signTransaction={wallet.sign}
            onSubmitted={() => setRefreshTrigger((n) => n + 1)}
          />
        )}

        {/* Blockchain kanıt görünümü — gönderimden sonra otomatik yenilenir */}
        <VerificationQuery
          videoHash={videoHash}
          walletAddress={wallet.address}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </main>
  );
}

// Inline WalletConnect that uses the shared wallet state
function WalletConnectInline({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { isConnected, address, network, isLoading, error, connect, disconnect } = wallet;

  if (!isConnected) {
    return (
      <div className="border-2 border-black p-4 bg-white">
        <div className="flex items-center justify-between">
          <p className="font-mono">Wallet: Not Connected</p>
          <button
            onClick={connect}
            disabled={isLoading}
            className="border-2 border-black px-4 py-1 font-bold hover:bg-gray-100 disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2 font-mono">{error}</p>}
      </div>
    );
  }

  return (
    <div className="border-2 border-black p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="font-mono text-sm">
          <p>Wallet: <span className="text-green-700">Connected</span></p>
          <p className="text-xs mt-1">{address?.slice(0, 8)}...{address?.slice(-8)}</p>
          {network && <p className="text-xs text-gray-500">Network: {network}</p>}
        </div>
        <button
          onClick={disconnect}
          className="border-2 border-black px-4 py-1 font-bold hover:bg-gray-100 text-sm"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
