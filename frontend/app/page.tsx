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

  // Navbar & Scroll Logic
  const [showNavbar, setShowNavbar] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem('authentiscan_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) setShowNavbar(false);
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
      {/* High-Contrast Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
        background: 'rgba(10, 11, 16, 0.95)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '4px',
            background: 'var(--accent-orange)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '18px',
            boxShadow: '0 0 15px var(--accent-orange)'
          }}>V</div>
          <span className="text-neon" style={{ fontWeight: '950', fontSize: '22px', letterSpacing: '-0.5px' }}>AUTHENTISCAN</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#gallery" className="text-neon" style={{ textDecoration: 'none', fontWeight: '800', fontSize: '13px', letterSpacing: '1px' }}>HISTORY_LOG</a>
            <button
              onClick={() => setIsProModalOpen(true)}
              className="text-neon-orange"
              style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px' }}
            >
              UPGRADE_PRO
            </button>
          </div>
          <button
            onClick={address ? undefined : handleConnect}
            style={{
              background: address ? 'rgba(0,229,255,0.1)' : 'var(--accent-cyan)',
              color: address ? 'var(--accent-cyan)' : '#000',
              border: address ? '1px solid var(--accent-cyan)' : 'none',
              padding: '10px 24px', borderRadius: '4px',
              fontWeight: '900', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: address ? 'none' : '0 0 15px rgba(0, 229, 255, 0.4)'
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

      {/* High-Contrast Hero */}
      <div className="animate-fade" style={{
        padding: '160px 40px 100px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 90px)', fontWeight: '950', color: 'white', marginBottom: '24px',
          letterSpacing: '-3px', lineHeight: '0.85', textTransform: 'uppercase'
        }}>
          DECODE THE <br />
          <span className="text-neon-orange">DEEPFAKE AGE</span>
        </h1>
        <p style={{
          fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '48px',
          lineHeight: '1.4', fontWeight: '600', maxWidth: '800px', margin: '0 auto 48px'
        }}>
          A premium blockchain foundation for video authenticity. <br />
          <span style={{ color: 'var(--accent-cyan)' }}>Powered by Stellar Network & AI Intelligence.</span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="btn-retro" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
            LAUNCH_SCANNER
          </button>
          <button className="btn-retro" style={{ background: 'transparent', border: '2px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
            TECHNICAL_SPEC
          </button>
        </div>
      </div>

      {/* Main Application Area - Ensuring High Visibility Panels */}
      <div id="scanner" className="animate-slide" style={{
        maxWidth: '1200px', margin: '0 auto 100px', padding: '0 40px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '40px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <VideoUpload
            onHashed={(h) => setVideoHash(h)}
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
              onSubmitted={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <VerificationQuery
            videoHash={videoHash}
            walletAddress={address}
            refreshTrigger={refreshTrigger}
          />

          <div className="retro-panel" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #1a1c2e 100%)', borderStyle: 'dashed' }}>
            <p className="text-neon-orange" style={{ fontWeight: '900', fontSize: '15px', marginBottom: '12px', letterSpacing: '1px' }}>// WHY_ANCHOR_SYSTEM</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Centrally stored videos can be manipulated. <br />
              AuthentiScan anchors a mathematical proof (Hash) and AI verdict on the **Stellar Ledger**, creating a permanent, public audit trail.
            </p>
          </div>
        </div>
      </div>

      {/* Support the Creator - High Contrast Section */}
      <div style={{ background: '#07080a', padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <h2 className="text-neon" style={{ fontSize: '32px', fontWeight: '950', marginBottom: '60px', letterSpacing: '1px' }}>SUPPORT_THE_VALIDATOR</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
          <a href="https://github.com/tunisch/block-chain-project" target="_blank" className="social-link" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '90px', height: '90px', background: 'var(--bg-tertiary)', border: '2px solid var(--accent-cyan)',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(0,229,255,0.1)'
            }}>
              <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" style={{ width: '48px', filter: 'invert(1)' }} />
            </div>
            <p className="text-neon" style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px' }}>GITHUB_REPOS</p>
          </a>

          <a href="https://www.linkedin.com/in/tunahanturkererturk/" target="_blank" className="social-link" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '90px', height: '90px', background: 'var(--bg-tertiary)', border: '2px solid var(--accent-orange)',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(255,107,0,0.1)'
            }}>
              <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style={{ width: '48px' }} />
            </div>
            <p className="text-neon-orange" style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px' }}>LINKEDIN_PROF</p>
          </a>
        </div>
      </div>

      {/* History Buffers */}
      <div id="gallery" style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 40px' }}>
        <h2 className="text-neon" style={{ fontSize: '28px', fontWeight: '950', marginBottom: '32px' }}>DATA_HISTORY_BUFFER</h2>
        {history.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {history.map((item) => (
              <div key={item.id} className="retro-panel" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }} onClick={() => setVideoHash(item.hash)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '10px', color: item.is_ai_generated ? 'var(--error)' : 'var(--success)',
                    fontWeight: '950', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px'
                  }}>
                    [{item.is_ai_generated ? 'AI' : 'AUTHENTIC'}]
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  HASH: {item.hash.slice(0, 12)}...
                </p>
                <div style={{ height: '4px', background: '#000', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${item.confidence_score}%`, background: item.is_ai_generated ? 'var(--error)' : 'var(--success)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'var(--text-tertiary)', fontWeight: '800', fontSize: '14px' }}>[!] DATA_BUFFER_EMPTY_WAITING_FOR_INPUT</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#000', padding: '80px 40px', borderTop: '1px solid var(--accent-orange)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="text-neon-orange" style={{ fontWeight: '950', fontSize: '24px', letterSpacing: '-0.5px' }}>AUTHENTISCAN.SYS</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: '600' }}>&copy; 2026 DECODING_REALITY_SINCE_ALPHA</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>
              BUILT_BY: TUNAHAN_TURKER_ERTURK_
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px' }}>STELLAR_NETWORK_VALIDATED</p>
          </div>
        </div>
      </footer>

      {/* Pro Modal */}
      {isProModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)'
        }} onClick={() => setIsProModalOpen(false)}>
          <div className="retro-panel" style={{ maxWidth: '500px', width: '90%', borderColor: 'var(--accent-orange)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-neon-orange" style={{ fontSize: '28px', fontWeight: '950', marginBottom: '24px' }}>UPGRADE_ACCESS_PRO</h2>
            <ul className="text-neon" style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px', fontWeight: '800' }}>
              <li>&gt; BULK_PROCESSING_CHANNELS</li>
              <li>&gt; FORENSIC_REPORT_ARTIFACT_MAPS</li>
              <li>&gt; ADVANCED_API_INTEGRATION_KEY</li>
            </ul>
            <button className="btn-retro" style={{ width: '100%', marginTop: '40px' }} onClick={() => setIsProModalOpen(false)}>
              SYSTEM_LOCKED_PENDING_RELEASE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
