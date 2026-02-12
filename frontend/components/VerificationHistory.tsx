'use client';

import { useEffect, useState } from 'react';

interface SubmittedVerification {
    videoHash: string;
    recordId?: number;
    txHash: string;
    timestamp: number;
    walletAddress: string;
}

export default function VerificationHistory() {
    const [entries, setEntries] = useState<SubmittedVerification[]>([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('authentiscan_submitted') || '[]');
            setEntries(saved.reverse()); // Most recent first
        } catch { setEntries([]); }

        // Listen for storage changes
        const handleStorage = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('authentiscan_submitted') || '[]');
                setEntries(saved.reverse());
            } catch { /* ignore */ }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Also refresh when component re-renders (after new submission)
    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const saved = JSON.parse(localStorage.getItem('authentiscan_submitted') || '[]');
                if (saved.length !== entries.length) {
                    setEntries([...saved].reverse());
                }
            } catch { /* ignore */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [entries.length]);

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', letterSpacing: '2px' }}>VERIFICATION_HISTORY</h3>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '800' }}>TOTAL: {entries.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {entries.length === 0 ? (
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>
                        NO_PREVIOUS_VERIFICATIONS
                    </p>
                ) : (
                    entries.slice(0, 10).map((entry, i) => (
                        <div key={entry.txHash || i} style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '8px',
                            borderLeft: '2px solid var(--success)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--success)' }}>
                                    #{entry.recordId ?? '?'} ANCHORED
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                    {formatDate(entry.timestamp)}
                                </span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                                HASH: {entry.videoHash.slice(0, 24)}...
                            </div>
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${entry.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '10px',
                                    color: 'var(--brand-orange)',
                                    textDecoration: 'none',
                                    fontWeight: '800',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                VIEW_ON_STELLAR_EXPLORER ↗
                            </a>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,106,0,0.03)', borderRadius: '8px', border: '1px solid rgba(255,106,0,0.08)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0, lineHeight: '1.5' }}>
                    💡 All verifications are permanently stored on the Stellar blockchain.
                    Use Stellar Explorer to independently verify any record.
                </p>
            </div>
        </div>
    );
}
