'use client';

import { useState, useEffect } from 'react';
import { getVerification, VerificationRecord } from '@/lib/soroban';

interface VerificationQueryProps {
    videoHash: string | null;
    walletAddress: string | null;
    refreshTrigger: number;
}

export default function VerificationQuery({ videoHash, walletAddress, refreshTrigger }: VerificationQueryProps) {
    const [record, setRecord] = useState<VerificationRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (videoHash && walletAddress) {
            handleQuery();
        } else {
            setRecord(null);
            setHasChecked(false);
        }
    }, [videoHash, walletAddress, refreshTrigger]);

    const handleQuery = async () => {
        if (!videoHash || !walletAddress) return;
        setIsLoading(true);
        try {
            const result = await getVerification(videoHash, walletAddress);
            setRecord(result);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setHasChecked(true);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    return (
        <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: 'white' }}>
                    04. LEDGER_AUDIT_LOG
                </h3>
                <button
                    onClick={handleQuery}
                    disabled={isLoading || !videoHash}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', padding: '8px 16px', borderRadius: '8px',
                        fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: '0.2s'
                    }}
                >
                    {isLoading ? 'SYNCING...' : 'REFRESH_LOG'}
                </button>
            </div>

            {!videoHash ? (
                <div style={{
                    padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)',
                    borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: '600' }}>
                        WATING_FOR_HASH_INPUT_BUFFER...
                    </p>
                </div>
            ) : hasChecked && record ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{
                        padding: '24px', background: 'rgba(16, 185, 129, 0.03)',
                        border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                                <span style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>VALID_ON_CHAIN_RECORD</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(record.video_hash)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-tertiary)' }}
                            >📋 COPY_HASH</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <DataRow label="ANCHOR_ID" value={`#${record.record_id}`} color="var(--brand-orange)" />
                            <DataRow label="VERDICT" value={record.is_ai_generated ? 'DEEPFAKE' : 'AUTHENTIC'} color={record.is_ai_generated ? 'var(--error)' : 'var(--success)'} />
                            <DataRow label="CONFIDENCE" value={`${record.confidence_score}%`} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <DataRow label="ANCHOR_HASH" value={record.video_hash} isMono />
                            </div>
                            <DataRow label="TIMESTAMP" value={new Date(record.timestamp * 1000).toLocaleString()} />
                            <DataRow label="STATUS" value="IMMUTABLE" color="var(--accent-cyan)" />
                        </div>
                    </div>
                </div>
            ) : hasChecked ? (
                <div style={{
                    padding: '30px', background: 'rgba(244, 63, 94, 0.03)',
                    border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: '16px', textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--error)', fontWeight: '800', fontSize: '14px', marginBottom: '8px' }}>[!] NO_LEDGER_RECORD_FOUND</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        This video hash has not been anchored to the Stellar Network by this wallet.
                    </p>
                </div>
            ) : (
                <button
                    className="btn-premium"
                    onClick={handleQuery}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    FETCH_BLOCKCHAIN_PROOF
                </button>
            )}
        </div>
    );
}

function DataRow({ label, value, color = 'white', isMono = false }: { label: string; value: string; color?: string; isMono?: boolean }) {
    return (
        <div>
            <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '1px', marginBottom: '4px' }}>{label}</p>
            <p style={{
                fontSize: isMono ? '12px' : '14px', fontWeight: '700', color: color,
                fontFamily: isMono ? 'var(--font-mono)' : 'inherit',
                wordBreak: isMono ? 'break-all' : 'normal'
            }}>{value}</p>
        </div>
    );
}
