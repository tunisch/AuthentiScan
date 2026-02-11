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
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Retro Navbar */}
      <nav className="glass" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--spacing-lg)',
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: '1px solid rgba(0,245,255,0.2)',
        background: 'rgba(0,0,0,0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '4px',
            background: 'var(--accent-orange)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'black', fontWeight: '900', fontSize: '20px',
            boxShadow: '0 0 15px var(--accent-orange)'
          }}>V</div>
          <span className="text-neon" style={{ fontWeight: '950', fontSize: '24px', letterSpacing: '-1px' }}>AuthentiScan</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', marginRight: '24px' }}>
            <a href="#gallery" className="text-neon" style={{ textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}>HISTORY_LOG</a>
            <button
              onClick={() => setIsProModalOpen(true)}
              className="text-neon-orange"
              style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '15px', cursor: 'pointer' }}
            >
              UPGRADE_PRO
            </button>
          </div>
          <button
            onClick={address ? undefined : handleConnect}
            style={{
              background: address ? 'var(--bg-tertiary)' : 'var(--accent-orange)',
              color: address ? 'white' : 'black',
              border: 'none', padding: '10px 20px', borderRadius: '2px',
              fontWeight: '900', fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: address ? 'none' : '0 0 15px var(--accent-orange)'
            }}
          >
            {address ? (
              <>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                {address.slice(0, 4)}...{address.slice(-4)}
              </>
            ) : 'LOGIN_STELLAR'}
          </button>
        </div>
      </nav>

      {/* Retro Hero */}
      <div className="animate-fade-in" style={{
        padding: '120px 20px 60px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '64px', fontWeight: '950', color: 'white', marginBottom: '20px',
          letterSpacing: '-2px', lineHeight: '0.9', textTransform: 'uppercase'
        }}>
          Visual Truth <br />
          <span className="text-neon-orange" style={{ fontSize: '80px' }}>Neon Blockchain</span>
        </h1>
        <p style={{
          fontSize: '20px', color: 'var(--accent-cyan)', marginBottom: '40px',
          lineHeight: '1.4', fontWeight: '700', textShadow: '0 0 10px rgba(0,245,255,0.3)',
          maxWidth: '700px', margin: '0 auto 40px'
        }}>
          DECODE DEEPFAKES. ANCHOR REALITY ON STELLAR. <br />
          [SYSTEM_READY_FOR_INPUT]
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button className="btn-retro" onClick={() => window.scrollTo({ top: 750, behavior: 'smooth' })}>
            INITIALIZE_SCAN
          </button>
          <button className="btn-retro" style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
            READ_DOCS
          </button>
        </div>
      </div>

      {/* Scanner Grid */}
      <div id="scanner" className="animate-retro-up" style={{
        maxWidth: '1200px', margin: '60px auto', padding: '0 20px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <VerificationQuery
            videoHash={videoHash}
            walletAddress={address}
            refreshTrigger={refreshTrigger}
          />

          {/* Retro Info Card */}
          <div className="retro-panel" style={{ borderStyle: 'dotted', borderColor: 'var(--accent-magenta)', boxShadow: '0 0 15px rgba(255,0,255,0.2)' }}>
            <p className="text-neon-orange" style={{ fontWeight: '900', fontSize: '15px', marginBottom: '10px' }}>// WHY_ANCHOR_ON_CHAIN?</p>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', lineHeight: '1.6' }}>
              DATABASE_INTEGRITY: 100%_SECURE. <br />
              STELLAR_NETWORK_PROVIDES_IMMUTABILITY_AGAINST_POST_SCAN_TAMPERING.
            </p>
          </div>
        </div>
      </div>

      {/* PRO Modal */}
      {isProModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
        }} onClick={() => setIsProModalOpen(false)}>
          <div className="retro-panel" style={{ maxWidth: '500px', width: '90%', borderColor: 'var(--accent-orange)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-neon-orange" style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>UPGRADE_TO_PRO.SYSTEM</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ color: 'var(--accent-cyan)' }}>&gt; BULK_PROCESSING: 1000_SCANS/SEC</li>
              <li style={{ color: 'var(--accent-cyan)' }}>&gt; FORENSIC_ARTIFACT_MAPPING</li>
              <li style={{ color: 'var(--accent-cyan)' }}>&gt; API_ENDPOINT_EXPOSURE</li>
            </ul>
            <button className="btn-retro" style={{ width: '100%', marginTop: '30px' }} onClick={() => setIsProModalOpen(false)}>
              SYSTEM_LOCKED_PENDING_RELEASE
            </button>
          </div>
        </div>
      )}

      {/* Support Section - ANIMATED Social Links */}
      <div style={{ background: '#080808', padding: '80px 20px', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', textAlign: 'center' }}>
        <h2 className="text-neon" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>SUPPORT_THE_VALIDATOR</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
          <a href="https://github.com" target="_blank" className="social-link" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', background: '#000', border: '2px solid var(--accent-cyan)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
            }}>
              <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" style={{ width: '40px', filter: 'invert(1)' }} />
            </div>
            <p className="text-neon" style={{ fontWeight: '800', fontSize: '14px' }}>GITHUB_REPOS</p>
          </a>

          <a href="https://www.linkedin.com/in/tunahanturkererturk/" target="_blank" className="social-link" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', background: '#000', border: '2px solid var(--accent-orange)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
            }}>
              <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style={{ width: '40px' }} />
            </div>
            <p className="text-neon-orange" style={{ fontWeight: '800', fontSize: '14px' }}>LINKEDIN_PROF</p>
          </a>
        </div>
      </div>

      {/* History Gallery */}
      <div id="gallery" style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
        <h2 className="text-neon" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>ENCRYPTED_HISTORY_BUFFER</h2>
        {history.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {history.map((item) => (
              <div key={item.id} className="retro-panel" style={{ cursor: 'pointer', padding: '15px' }} onClick={() => setVideoHash(item.hash)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: item.is_ai_generated ? 'var(--error)' : 'var(--success)', fontWeight: '900' }}>
                    [{item.is_ai_generated ? 'AI' : 'REAL'}]
                  </span>
                  <span style={{ fontSize: '10px', color: '#666' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>HASH: {item.hash.slice(0, 10)}...</p>
                <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>CONFIDENCE: {item.confidence_score}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', background: '#080808', border: '1px dashed #222' }}>
            <p style={{ color: '#444', fontWeight: '900' }}>[!] DATA_BUFFER_EMPTY</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#000', padding: '60px 20px', borderTop: '2px solid var(--accent-orange)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="text-neon-orange" style={{ fontWeight: '900', fontSize: '20px' }}>AUTHENTISCAN.EXE</p>
            <p style={{ color: '#666', fontSize: '12px' }}>DECODING_REALITY_SINCE_2026</p>
          </div>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: '800' }}>
            BUILD_BY: TUNAHAN_TURKER_ERTURK_ // STELLAR_NETWORK_ENABLED
          </p>
        </div>
      </footer>
    </main>
  );
}
