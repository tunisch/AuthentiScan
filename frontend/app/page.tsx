'use client';

import { useState, useEffect, useRef } from 'react';
import VideoUpload from '@/components/VideoUpload';
import AnalysisResult from '@/components/AnalysisResult';
import SubmitVerification from '@/components/SubmitVerification';
import VerificationQuery from '@/components/VerificationQuery';
import VerificationHistory from '@/components/VerificationHistory';
import { useWallet } from '@/lib/useWallet';
import { getVerification, VerificationRecord } from '@/lib/soroban';

interface HistoryItem {
  id: string;
  hash: string;
  is_ai_generated: boolean;
  confidence_score: number;
  timestamp: number;
}

export default function Home() {
  const { address, sign, connect, isConnected, isLoading: isWalletLoading } = useWallet();
  const [videoHash, setVideoHash] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Workflow State: 0=Upload, 1=Analysis, 2=Anchor, 3=Audit
  const [currentStep, setCurrentStep] = useState(0);
  const [existingRecord, setExistingRecord] = useState<VerificationRecord | null>(null);
  const [isCheckingBlockchain, setIsCheckingBlockchain] = useState(false);

  // Navbar Hide/Show Logic
  const [showNavbar, setShowNavbar] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem('authentiscan_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) setShowNavbar(false);
      else setShowNavbar(true);
      if (currentScrollY > 400) setShowScrollTop(true);
      else setShowScrollTop(false);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [lastRecordId, setLastRecordId] = useState<number | null>(null);

  const handleVerificationSubmitted = (recordId?: number) => {
    setRefreshTrigger((prev) => prev + 1);
    setCurrentStep(4); // 4 = all steps completed (AUDIT done)

    // Store record_id for fallback display
    if (recordId) {
      setLastRecordId(recordId);
    }
  };

  const handleReset = () => {
    setVideoHash(null);
    setAnalysisResult(null);
    setCurrentStep(0);
    setLastRecordId(null);
    setExistingRecord(null);
  };

  // AUTO-CHECK: When hash is computed, immediately check blockchain
  useEffect(() => {
    if (!videoHash || !address) return;
    setIsCheckingBlockchain(true);
    getVerification(videoHash, address)
      .then(record => {
        if (record) {
          console.log('[AutoCheck] ✅ Existing record found!', record);
          setExistingRecord(record);
        } else {
          console.log('[AutoCheck] No existing record for this hash');
          setExistingRecord(null);
        }
      })
      .catch(err => {
        console.warn('[AutoCheck] Check failed:', err);
        setExistingRecord(null);
      })
      .finally(() => setIsCheckingBlockchain(false));
  }, [videoHash, address]);

  useEffect(() => {
    if (analysisResult && videoHash) {
      setCurrentStep(2); // Analysis complete, ready to anchor
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        hash: videoHash,
        is_ai_generated: analysisResult.is_ai_generated,
        confidence_score: analysisResult.confidence_score,
        timestamp: Date.now(),
      };
      setHistory(prev => {
        const updated = [newItem, ...prev.filter(h => h.hash !== videoHash)].slice(0, 10);
        localStorage.setItem('authentiscan_history', JSON.stringify(updated));
        return updated;
      });
    }
  }, [analysisResult, videoHash]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.warn("Redirection to Freighter download page...");
      window.open('https://www.freighter.app/', '_blank');
    }
  };

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
      {/* 1. Premium Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '80px', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px',
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(11, 15, 20, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(24px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#000', fontWeight: '950', fontSize: '18px',
            boxShadow: '0 0 20px rgba(255, 106, 0, 0.3)'
          }}>A</div>
          <span style={{ fontWeight: '950', fontSize: '20px', letterSpacing: '-0.5px', color: 'white' }}>AUTHENTISCAN</span>
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>STELLAR_TESTNET: ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <a href="#history" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>HISTORY_LOG</a>
          <button
            onClick={address ? undefined : handleConnect}
            className={!address ? "btn-premium" : ""}
            disabled={isWalletLoading}
            style={{
              background: address ? 'rgba(255,255,255,0.05)' : undefined,
              color: address ? 'var(--text-primary)' : undefined,
              border: address ? '1px solid rgba(255,255,255,0.1)' : undefined,
              padding: '10px 24px', borderRadius: '10px',
              fontWeight: '800', fontSize: '13px', cursor: 'pointer'
            }}
          >
            {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : isWalletLoading ? 'CONNECTING...' : 'CONNECT_WALLET'}
          </button>
        </div>
      </nav>

      {/* 2. cinematic Hero */}
      <section style={{ padding: '200px 60px 100px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="animate-premium">
          <h1 style={{ fontSize: 'clamp(56px, 10vw, 110px)', fontWeight: '950', color: 'white', marginBottom: '24px', letterSpacing: '-4px', lineHeight: '0.85' }}>
            DECODE THE <br /> <span className="text-gradient">DEEPFAKE AGE</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'var(--text-secondary)', marginBottom: '56px', maxWidth: '750px', margin: '0 auto 56px' }}>
            AI-powered video authenticity verification. <br />
            <span style={{ color: 'white', fontWeight: '700' }}>Anchored to Stellar blockchain for immutable proof.</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <button className="btn-premium" onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}>Launch Scanner</button>
            <button className="btn-secondary" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>How it works</button>
          </div>
        </div>
        <div className={`drawer-content ${isDrawerOpen ? 'open' : ''}`} style={{ marginTop: '60px' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <TechDetail title="Spatial Anomaly" desc="Pixel-level inconsistency detection." />
            <TechDetail title="Temporal Consistency" desc="Verifies frame-to-frame stability." />
            <TechDetail title="Spectral Deviation" desc="Voices and audio print mapping." />
          </div>
        </div>
      </section>

      {/* 3. Steps */}
      <div style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 40px' }}>
        <div className="step-container">
          <StepItem index={1} label="Upload" status={currentStep >= 1 ? 'completed' : currentStep === 0 ? 'active' : 'pending'} />
          <StepItem index={2} label="Analysis" status={currentStep >= 2 ? 'completed' : currentStep === 1 ? 'active' : 'pending'} />
          <StepItem index={3} label="Anchor" status={currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : 'pending'} />
          <StepItem index={4} label="Audit" status={currentStep >= 4 ? 'completed' : currentStep === 3 ? 'active' : 'pending'} />
        </div>
      </div>

      {/* 4. Main Product */}
      <div id="scanner" className="animate-premium" style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <VideoUpload onHashed={(h) => { setVideoHash(h); setCurrentStep(1); setExistingRecord(null); }} onAnalyzed={(r) => setAnalysisResult(r)} isConnected={!!address} />

            {/* BLOCKCHAIN AUTO-CHECK: Show existing record if found */}
            {isCheckingBlockchain && videoHash && (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(255,106,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div className="loading-spinner" />
                  <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '2px', color: 'var(--brand-orange)' }}>CHECKING_BLOCKCHAIN...</span>
                </div>
              </div>
            )}

            {existingRecord && videoHash && (
              <ExistingRecordCard record={existingRecord} videoHash={videoHash} onContinueAnyway={() => setExistingRecord(null)} />
            )}

            {/* Normal flow: only show if NO existing record */}
            {!existingRecord && analysisResult && videoHash && <AnalysisResult analysis={analysisResult} videoHash={videoHash} />}
            {!existingRecord && analysisResult && videoHash && <SubmitVerification analysis={analysisResult} videoHash={videoHash} walletAddress={address} signTransaction={sign} onSubmitted={handleVerificationSubmitted} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {address && (
              <div className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,106,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,106,0,0.2)' }}>👤</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>CONNECTED_NODE</p>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-mono)' }}>{address.slice(0, 12)}...</p>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', alignItems: 'start' }}>
              <VerificationQuery videoHash={videoHash} walletAddress={address} refreshTrigger={refreshTrigger} lastRecordId={lastRecordId} />
              <VerificationHistory />
            </div>
            <div className="glass-card" style={{ padding: '40px', background: 'linear-gradient(180deg, rgba(255,106,0,0.03) 0%, rgba(11,15,20,0) 100%)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '24px' }}>Why Anchoring Matters</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}> AuthentiScan stores a cryptographic fingerprint and AI verdict on the Stellar ledger, creating a permanent, public audit trail.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <FeatureItem icon="🛡️" title="Security" desc="Cryptographic integrity." />
                <FeatureItem icon="🔗" title="Immutable" desc="Records cannot be modified." />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: '#000', padding: '100px 60px', borderTop: '1px solid rgba(255, 106, 0, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: '950', fontSize: '24px', color: 'white', marginBottom: '24px' }}>AUTHENTISCAN</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '400px' }}>AI analysis is probabilistic. Powered by Stellar Network.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: '800' }}>POWERED BY STELLAR</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>&copy; 2026 AuthentiScan Lab</p>
          </div>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px',
          borderRadius: '50%', background: 'var(--brand-gradient)', color: 'black',
          border: 'none', cursor: 'pointer', zIndex: 1000,
          opacity: showScrollTop ? 1 : 0, transition: '0.3s'
        }}
      >
        ↑
      </button>
    </main>
  );
}

function StepItem({ index, label, status }: { index: number; label: string; status: 'active' | 'completed' | 'pending' }) {
  return (
    <div className={`step-item ${status}`}>
      <div className="step-dot">
        {status === 'completed' ? '✓' : index}
      </div>
      <span className="step-label">{label}</span>
    </div>
  );
}

function TechDetail({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h4 style={{ color: 'white', fontWeight: '900', fontSize: '14px', marginBottom: '12px', letterSpacing: '0.5px' }}>{title.toUpperCase()}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div>
        <p style={{ color: 'white', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', lineHeight: '1.4' }}>{desc}</p>
      </div>
    </div>
  );
}

function SocialCard({ href, title, label, icon, color }: any) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', transition: '0.3s' }}>
      <div className="glass-card" style={{ padding: '32px 48px', minWidth: '240px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: 'white', fontWeight: '900', fontSize: '16px' }}>{title}</p>
        <div style={{ height: '2px', width: '0%', background: color, marginTop: '12px', transition: '0.3s' }} className="bar" />
      </div>
      <style jsx>{`
        a:hover .bar { width: 100%; }
        a:hover { transform: translateY(-5px); }
      `}</style>
    </a>
  );
}

function ModalItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: '700', fontSize: '14px' }}>
      <span style={{ color: 'var(--brand-orange)' }}>✓</span> {text}
    </li>
  );
}

function FooterLink({ text }: { text: string }) {
  return (
    <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}>{text}</a>
  );
}

function ExistingRecordCard({ record, videoHash, onContinueAnyway }: { record: any; videoHash: string; onContinueAnyway: () => void }) {
  const date = record.timestamp ? new Date(record.timestamp * 1000) : null;
  const verdict = record.is_ai_generated ? 'AI_GENERATED' : 'AUTHENTIC';
  const verdictColor = record.is_ai_generated ? '#ff4444' : 'var(--success)';

  return (
    <div className="glass-card animate-premium" style={{
      padding: '0',
      overflow: 'hidden',
      border: `1px solid ${record.is_ai_generated ? 'rgba(255,68,68,0.3)' : 'rgba(0,255,136,0.3)'}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: record.is_ai_generated
          ? 'linear-gradient(135deg, rgba(255,68,68,0.1) 0%, rgba(11,15,20,1) 100%)'
          : 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(11,15,20,1) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: `${verdictColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${verdictColor}`,
          }}>
            <span style={{ fontSize: '18px' }}>🔍</span>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '950', letterSpacing: '2px', color: verdictColor, margin: 0 }}>
              EXISTING_RECORD_FOUND
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
              This video was previously verified on the Stellar blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>VERDICT</p>
            <p style={{ fontSize: '16px', fontWeight: '950', color: verdictColor, margin: 0 }}>{verdict}</p>
          </div>
          <div>
            <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>CONFIDENCE</p>
            <p style={{ fontSize: '16px', fontWeight: '950', color: 'white', margin: 0 }}>{record.confidence_score}%</p>
          </div>
          <div>
            <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>RECORD_ID</p>
            <p style={{ fontSize: '16px', fontWeight: '950', color: 'var(--brand-orange)', margin: 0 }}>#{record.record_id}</p>
          </div>
          <div>
            <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>VERIFIED_DATE</p>
            <p style={{ fontSize: '14px', fontWeight: '800', color: 'white', margin: 0 }}>
              {date ? date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Hash */}
        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>MATCHING_HASH</p>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-all' }}>
            {videoHash}
          </p>
        </div>

        {/* Submitter */}
        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px', margin: '0 0 4px 0' }}>ORIGINAL_SUBMITTER</p>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', margin: 0 }}>
            {record.submitter || 'Unknown'}
          </p>
        </div>

        {/* Info */}
        <div style={{ padding: '12px', background: 'rgba(0,255,136,0.03)', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.08)', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            ✅ <strong>Blockchain Verified:</strong> This video&apos;s cryptographic fingerprint matches an existing on-chain record.
            The verification is immutable and independently auditable.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onContinueAnyway}
            style={{
              flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800',
              letterSpacing: '1px', cursor: 'pointer', transition: '0.3s',
            }}
          >
            CONTINUE_NEW_ANALYSIS →
          </button>
        </div>
      </div>
    </div>
  );
}
