'use client';

import { useState, useEffect, useRef } from 'react';
import VideoUpload from '@/components/VideoUpload';
import AnalysisResult from '@/components/AnalysisResult';
import SubmitVerification from '@/components/SubmitVerification';
import VerificationQuery from '@/components/VerificationQuery';
import { useWallet } from '@/lib/useWallet';

interface HistoryItem {
  id: string;
  hash: string;
  is_ai_generated: boolean;
  confidence_score: number;
  timestamp: number;
}

export default function Home() {
  const { address, sign, connect, isConnected } = useWallet();
  const [videoHash, setVideoHash] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Workflow State: 0=Upload, 1=Analysis, 2=Anchor, 3=Audit
  const [currentStep, setCurrentStep] = useState(0);

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
      window.open('https://www.freighter.app/', '_blank');
    }
  };

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
      {/* 1. Premium Navigation with Status */}
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

          {/* System Status Indicator */}
          <div style={{
            height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 12px'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{
              fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px'
            }}>STELLAR_TESTNET: ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#history" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>HISTORY_LOG</a>
            <button
              onClick={() => setIsProModalOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: '800', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px' }}
            >
              UPGRADE_PRO
            </button>
          </div>
          <button
            onClick={address ? undefined : handleConnect}
            className={!address ? "btn-premium" : ""}
            style={{
              background: address ? 'rgba(255,255,255,0.05)' : undefined,
              color: address ? 'var(--text-primary)' : undefined,
              border: address ? '1px solid rgba(255,255,255,0.1)' : undefined,
              padding: '10px 24px', borderRadius: '10px',
              fontWeight: '800', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {address ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
                {address.slice(0, 4)}...{address.slice(-4)}
              </div>
            ) : 'CONNECT_WALLET'}
          </button>
        </div>
      </nav>

      {/* 2. Cinematic Hero Section */}
      <section style={{
        padding: '200px 60px 100px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto',
      }}>
        <div className="animate-premium">
          <h1 style={{
            fontSize: 'clamp(56px, 10vw, 110px)', fontWeight: '950', color: 'white', marginBottom: '24px',
            letterSpacing: '-4px', lineHeight: '0.85'
          }}>
            DECODE THE <br />
            <span className="text-gradient">DEEPFAKE AGE</span>
          </h1>
          <p style={{
            fontSize: '22px', color: 'var(--text-secondary)', marginBottom: '56px',
            lineHeight: '1.4', fontWeight: '500', maxWidth: '750px', margin: '0 auto 56px'
          }}>
            AI-powered video authenticity verification. <br />
            <span style={{ color: 'white', fontWeight: '700' }}>Anchored to Stellar blockchain for immutable proof.</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <button className="btn-premium" onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}>
              Launch Scanner
            </button>
            <button
              className="btn-secondary"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              How it works
            </button>
          </div>
        </div>

        {/* Technical Expandable Drawer */}
        <div className={`drawer-content ${isDrawerOpen ? 'open' : ''}`} style={{ marginTop: '60px' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <TechDetail
              title="Spatial Anomaly Detection"
              desc="Convolutional networks analyze pixel-level inconsistencies in facial features and environmental lighting backgrounds."
            />
            <TechDetail
              title="Temporal Consistency"
              desc="Recurrent architectures verify frame-to-frame stability to detect unnatural jitters common in generative AI frame synthesis."
            />
            <TechDetail
              title="Spectral Deviation"
              desc="Deep audio analysis maps voice prints against known AI speech patterns to identify synthetic clone artifacts."
            />
          </div>
        </div>
      </section>

      {/* 3. Workflow Step Indicator */}
      <div style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 40px' }}>
        <div className="step-container">
          <StepItem index={1} label="Upload" status={currentStep >= 1 ? 'completed' : currentStep === 0 ? 'active' : 'pending'} />
          <StepItem index={2} label="Analysis" status={currentStep >= 2 ? 'completed' : currentStep === 1 ? 'active' : 'pending'} />
          <StepItem index={3} label="Anchor" status={currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : 'pending'} />
          <StepItem index={4} label="Audit" status={currentStep === 3 ? 'active' : 'pending'} />
        </div>
      </div>

      {/* 4. Main Product Demo Section */}
      <div id="scanner" className="animate-premium" style={{
        maxWidth: '1200px', margin: '0 auto 120px', padding: '0 60px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '60px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <VideoUpload
            onHashed={(h) => { setVideoHash(h); setCurrentStep(1); }}
            onAnalyzed={(r) => setAnalysisResult(r)}
            isConnected={!!address}
          />

          {analysisResult && videoHash && (
            <AnalysisResult
              analysis={analysisResult}
              videoHash={videoHash}
            />
          )}

          {analysisResult && videoHash && (
            <SubmitVerification
              analysis={analysisResult}
              videoHash={videoHash}
              walletAddress={address}
              signTransaction={sign}
              onSubmitted={() => { setRefreshTrigger(prev => prev + 1); setCurrentStep(3); }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* User Dashboard Panel (Integrated into Sidebar) */}
          {address && (
            <div className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,106,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,106,0,0.2)'
              }}>
                👤
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>CONNECTED_NODE</p>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'white', fontFamily: 'var(--font-mono)' }}>{address.slice(0, 12)}...</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>TOTAL_SCANS</p>
                <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--brand-orange)' }}>{history.length}</p>
              </div>
            </div>
          )}

          <VerificationQuery
            videoHash={videoHash}
            walletAddress={address}
            refreshTrigger={refreshTrigger}
          />

          {/* Why Anchor Section - Refined */}
          <div className="glass-card" style={{ padding: '40px', background: 'linear-gradient(180deg, rgba(255,106,0,0.03) 0%, rgba(11,15,20,0) 100%)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '24px', letterSpacing: '1px' }}>
              Why Blockchain Anchoring Matters
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '32px' }}>
              Centralized platforms can alter or remove videos at any time. AuthentiScan stores a cryptographic fingerprint and AI verdict on the Stellar ledger, creating a <span style={{ color: 'white', fontWeight: '700' }}>permanent, public audit trail</span> that anyone can verify independently.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <FeatureItem icon="🛡️" title="Security" desc="End-to-end cryptographic integrity." />
              <FeatureItem icon="🔗" title="Immutable" desc="Ledger records cannot be modified." />
              <FeatureItem icon="👁️" title="Visibility" desc="Publicly auditable proof of origin." />
              <FeatureItem icon="🔓" title="Open" desc="Independent verification API." />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Support & Socials - Investor Ready */}
      <div style={{ background: '#07090d', padding: '120px 60px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '950', color: 'white', marginBottom: '64px', letterSpacing: '1px' }}>RESEARCH_COLLABORATION</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <SocialCard
              href="https://github.com/tunisch/block-chain-project"
              title="GitHub Repository"
              label="Source Archive"
              icon="📂"
              color="var(--accent-cyan)"
            />
            <SocialCard
              href="https://www.linkedin.com/in/tunahanturkererturk/"
              title="LinkedIn Profile"
              label="Lead Researcher"
              icon="👔"
              color="var(--brand-orange)"
            />
          </div>
        </div>
      </div>

      {/* 6. History Buffer Area */}
      <div id="history" style={{ maxWidth: '1200px', margin: '140px auto', padding: '0 60px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: 'white', marginBottom: '40px' }}>ANALYSIS_HISTORY_BUFFER</h2>
        {history.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ cursor: 'pointer', padding: '24px' }}
                onClick={() => { setVideoHash(item.hash); setCurrentStep(2); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '10px', color: item.is_ai_generated ? 'var(--error)' : 'var(--success)',
                    fontWeight: '950', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '4px'
                  }}>
                    {item.is_ai_generated ? 'DEEPFAKE' : 'AUTHENTIC'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '700' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                  HASH: {item.hash.slice(0, 16)}...
                </p>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${item.confidence_score}%`, background: item.is_ai_generated ? 'var(--error)' : 'var(--success)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.01)', borderRadius: '24px',
            border: '1px dashed rgba(255,255,255,0.08)'
          }}>
            <p style={{ color: 'var(--text-tertiary)', fontWeight: '800', fontSize: '15px' }}>NO_LOCAL_HISTORY_RECOVERED</p>
          </div>
        )}
      </div>

      {/* 7. Premium Footer */}
      <footer style={{ background: '#000', padding: '100px 60px', borderTop: '1px solid rgba(255, 106, 0, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontWeight: '950', fontSize: '24px', color: 'white', marginBottom: '8px' }}>AUTHENTISCAN</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: '600' }}>Next-generation video authenticity verification.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
              <FooterLink text="Documentation" />
              <FooterLink text="API Status" />
              <FooterLink text="Privacy" />
            </div>
            {/* Critical Performance & Risk Disclaimer */}
            <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', maxWidth: '400px' }}>
              AI analysis is probabilistic and does not constitute definitive proof of authenticity. Final judgment should be supported by multi-modal forensic evidence.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>POWERED BY STELLAR NETWORK</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: '500' }}>&copy; 2026 AuthentiScan Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px',
          borderRadius: '50%', background: 'var(--brand-gradient)', color: 'black',
          border: 'none', cursor: 'pointer', zIndex: 1000,
          opacity: showScrollTop ? 1 : 0, transform: showScrollTop ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900',
          boxShadow: '0 10px 20px rgba(255,106,0,0.4)', pointerEvents: showScrollTop ? 'auto' : 'none'
        }}
      >
        ↑
      </button>

      {/* Pro Modal */}
      {isProModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)'
        }} onClick={() => setIsProModalOpen(false)}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '90%', padding: '48px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '32px', fontWeight: '950', color: 'white', marginBottom: '16px' }}>UPGRADE_TO_PRO</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>Unlock industrial-grade features for media enterprises and forensic laboratories.</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
              <ModalItem text="Batch Forensic Processing" />
              <ModalItem text="Priority AI Compute Nodes" />
              <ModalItem text="Web3 API Access Key" />
            </ul>
            <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsProModalOpen(false)}>
              Join Waitlist
            </button>
          </div>
        </div>
      )}
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
    <a href={href} target="_blank" style={{ textDecoration: 'none', transition: '0.3s' }}>
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
