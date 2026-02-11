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
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 animate-fade-in" style={{
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              🎬
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              Video Verification
            </h1>
          </div>
          <WalletConnectInline wallet={wallet} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="animate-fade-in" style={{
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        textAlign: 'center',
      }}>
        <h2 className="gradient-text" style={{
          fontSize: '56px',
          fontWeight: '700',
          lineHeight: '1.1',
          marginBottom: 'var(--spacing-md)',
        }}>
          Verify Video Authenticity
          <br />
          on Blockchain
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Upload any video or paste a URL. Our AI analyzes it, and the result is permanently stored on Stellar blockchain.
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto" style={{
        padding: '0 var(--spacing-lg) var(--spacing-xl)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Upload Card */}
          <div className="animate-slide-up">
            <VideoUpload
              onHashed={(hash) => setVideoHash(hash)}
              onAnalyzed={(result) => setAnalysis(result)}
            />
          </div>

          {/* Analysis Result */}
          {analysis && (
            <div className="animate-slide-up">
              <AnalysisResult analysis={analysis} videoHash={videoHash!} />
            </div>
          )}

          {/* Submit Button */}
          {analysis && videoHash && (
            <div className="animate-slide-up">
              <SubmitVerification
                analysis={analysis}
                videoHash={videoHash}
                walletAddress={wallet.address}
                signTransaction={wallet.sign}
                onSubmitted={() => setRefreshTrigger((n) => n + 1)}
              />
            </div>
          )}

          {/* Blockchain Proof */}
          <div className="animate-slide-up">
            <VerificationQuery
              videoHash={videoHash}
              walletAddress={wallet.address}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// Inline WalletConnect with modern styling
function WalletConnectInline({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  const { isConnected, address, network, isLoading, error, connect, disconnect } = wallet;

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        {error && (
          <span style={{ fontSize: '14px', color: 'var(--error)' }}>
            {error}
          </span>
        )}
        <button
          onClick={connect}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
            color: 'white',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass" style={{
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 8px var(--success)',
        }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {network && (
            <span style={{
              marginLeft: '8px',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
            }}>
              {network}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={disconnect}
        style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: 'none',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
