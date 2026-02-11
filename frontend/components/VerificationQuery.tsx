'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVerification, getVerificationCount, VerificationRecord } from '@/lib/soroban';

interface VerificationQueryProps {
    videoHash: string | null;
    walletAddress: string | null;
    refreshTrigger: number;
}

export default function VerificationQuery({ videoHash, walletAddress, refreshTrigger }: VerificationQueryProps) {
    const [record, setRecord] = useState<VerificationRecord | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleQuery = useCallback(async () => {
        if (!videoHash || !walletAddress) return;

        setStatus('loading');
        setErrorMsg(null);
        setRecord(null);

        try {
            const [verificationResult, countResult] = await Promise.all([
                getVerification(videoHash, walletAddress),
                getVerificationCount(walletAddress),
            ]);

            setTotalCount(countResult);

            if (verificationResult) {
                setRecord(verificationResult);
                setStatus('found');
            } else {
                setStatus('not_found');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Ledger query failed');
            setStatus('error');
        }
    }, [videoHash, walletAddress]);

    useEffect(() => {
        if (refreshTrigger > 0 && videoHash && walletAddress) {
            handleQuery();
        }
    }, [refreshTrigger, handleQuery]);

    return (
        <div className="retro-panel">
            <h3 className="text-neon" style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>
                // LEDGER_AUDIT_LOG
            </h3>

            <button
                onClick={handleQuery}
                disabled={!videoHash || !walletAddress || status === 'loading'}
                className="btn-retro"
                style={{ width: '100%', marginBottom: '20px' }}
            >
                {status === 'loading' ? 'SYNCING_WITH_STELLAR...' : 'FETCH_BLOCKCHAIN_PROOF'}
            </button>

            {status === 'found' && record && (
                <div style={{ border: '1px solid #333' }}>
                    <div style={{ background: '#000', padding: '10px 15px', borderBottom: '1px solid #333' }}>
                        <p style={{ fontWeight: '900', fontSize: '12px', color: 'var(--accent-magenta)', letterSpacing: '1px' }}>
                            &gt; IMMUTABLE_DATA_CHUNKS
                        </p>
                    </div>

                    <div style={{ background: '#0a0a0a' }}>
                        <Row label="CONTENT_ID" value={record.video_hash} truncate />
                        <Row label="VALIDATOR_PUB" value={record.submitter} truncate />
                        <Row
                            label="VERDICT_STATUS"
                            value={record.is_ai_generated ? 'AI_DETECTED' : 'AUTHENTIC_VERIFIED'}
                            highlight={record.is_ai_generated ? 'red' : 'green'}
                        />
                        <Row label="ACCURACY_RATE" value={`${record.confidence_score}%`} />
                    </div>

                    {totalCount !== null && (
                        <div style={{ background: '#000', padding: '10px 15px', fontSize: '11px', color: '#666' }}>
                            LEDGER_ENTRIES_FOR_VALIDATOR: {totalCount}
                        </div>
                    )}
                </div>
            )}

            {status === 'not_found' && (
                <div style={{ padding: '20px', textAlign: 'center', background: '#000', border: '1px dashed #333' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>[!] NO_LEDGER_DATA_FOUND_FOR_TARGET_HASH</p>
                </div>
            )}

            {status === 'error' && (
                <p style={{ fontSize: '14px', color: 'var(--error)', textAlign: 'center', marginTop: '10px' }}>[ERR]: {errorMsg?.toUpperCase()}</p>
            )}
        </div>
    );
}

function Row({ label, value, truncate, highlight }: { label: string; value: string; truncate?: boolean; highlight?: 'red' | 'green' }) {
    const displayValue = truncate && value.length > 20 ? `${value.slice(0, 10)}...${value.slice(-10)}` : value;

    let color = 'white';
    if (highlight === 'red') color = 'var(--error)';
    if (highlight === 'green') color = 'var(--success)';

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #1a1a1a'
        }}>
            <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '800' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: '900', color: color, fontFamily: 'var(--font-mono)' }}>
                {displayValue.toUpperCase()}
            </span>
        </div>
    );
}
