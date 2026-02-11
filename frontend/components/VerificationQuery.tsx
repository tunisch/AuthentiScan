'use client';

// Blockchain'den doğrulama verisini oku ve akademik kanıt olarak göster
// Read verification data from blockchain and display as academic proof

import { useState, useEffect, useCallback } from 'react';
import { getVerification, getVerificationCount, VerificationRecord } from '@/lib/soroban';

interface VerificationQueryProps {
    videoHash: string | null;
    walletAddress: string | null;
    // Otomatik yenileme tetikleyicisi — her değiştiğinde yeniden sorgula
    // Auto-refresh trigger — re-query whenever this changes
    refreshTrigger: number;
}

export default function VerificationQuery({ videoHash, walletAddress, refreshTrigger }: VerificationQueryProps) {
    const [record, setRecord] = useState<VerificationRecord | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [queryTime, setQueryTime] = useState<string | null>(null);

    const handleQuery = useCallback(async () => {
        if (!videoHash || !walletAddress) return;

        setStatus('loading');
        setErrorMsg(null);
        setRecord(null);

        const startTime = Date.now();

        try {
            const [verificationResult, countResult] = await Promise.all([
                getVerification(videoHash, walletAddress),
                getVerificationCount(walletAddress),
            ]);

            setTotalCount(countResult);
            setQueryTime(`${Date.now() - startTime}ms`);

            if (verificationResult) {
                setRecord(verificationResult);
                setStatus('found');
                console.log('✅ On-chain record:', verificationResult);
            } else {
                setStatus('not_found');
                console.log('ℹ️ No record found');
            }
        } catch (err: any) {
            console.error('❌ Query error:', err);
            setErrorMsg(err.message || 'Failed to query contract');
            setStatus('error');
        }
    }, [videoHash, walletAddress]);

    // refreshTrigger değiştiğinde otomatik sorgula
    // Auto-query when refreshTrigger changes (after successful submission)
    useEffect(() => {
        if (refreshTrigger > 0 && videoHash && walletAddress) {
            handleQuery();
        }
    }, [refreshTrigger, handleQuery]);

    return (
        <div className="glass" style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                }}>
                    On-Chain Verification Record
                </h3>
                {queryTime && status === 'found' && (
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        query: {queryTime}
                    </span>
                )}
            </div>

            <button
                onClick={handleQuery}
                disabled={!videoHash || !walletAddress || status === 'loading'}
                style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: !videoHash || !walletAddress || status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-base)',
                    marginBottom: 'var(--spacing-md)',
                }}
                onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
            >
                {status === 'loading' ? '⏳ Querying blockchain...' : 'Read Verification from Blockchain'}
            </button>

            {!walletAddress && (
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Connect wallet to query</p>
            )}
            {!videoHash && walletAddress && (
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Upload or analyze a video first</p>
            )}

            {/* ── LOADING ── */}
            {status === 'loading' && (
                <div style={{
                    padding: 'var(--spacing-lg)',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--glass-border)',
                }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        ⏳ Reading from Stellar Testnet...
                    </p>
                </div>
            )}

            {/* ── FOUND — Academic proof table ── */}
            {status === 'found' && record && (
                <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
                        padding: '12px 16px',
                    }}>
                        <p style={{
                            fontWeight: '700',
                            fontSize: '14px',
                            color: 'white',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <span>✅</span> Blockchain Verification Proof
                        </p>
                    </div>

                    {/* Data table */}
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        background: 'var(--bg-secondary)',
                        fontSize: '14px',
                    }}>
                        <tbody>
                            <Row label="Video Hash" value={record.video_hash} truncate />
                            <Row label="Submitter" value={record.submitter} truncate />
                            <Row
                                label="AI Generated"
                                value={record.is_ai_generated ? 'YES' : 'NO'}
                                highlight={record.is_ai_generated ? 'red' : 'green'}
                            />
                            <Row label="Confidence" value={`${record.confidence_score}%`} />
                            <Row
                                label="Timestamp"
                                value={new Date(record.timestamp * 1000).toLocaleString()}
                            />
                            <Row label="Network" value="Stellar Testnet" />
                        </tbody>
                    </table>

                    {/* Footer */}
                    {totalCount !== null && (
                        <div style={{
                            padding: '10px 16px',
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            background: 'rgba(0,0,0,0.2)',
                            borderTop: '1px solid var(--glass-border)',
                        }}>
                            Total on-chain verifications for this wallet: {totalCount}
                        </div>
                    )}
                </div>
            )}

            {/* ── NOT FOUND ── */}
            {status === 'not_found' && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 159, 10, 0.1)',
                    border: '1px solid var(--warning)',
                }}>
                    <p style={{ fontSize: '14px', color: 'var(--warning)', fontWeight: '600' }}>⚠️ No record found</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        No verification exists for this video hash + wallet combination.
                    </p>
                </div>
            )}

            {/* ── ERROR ── */}
            {status === 'error' && errorMsg && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid var(--error)',
                }}>
                    <p style={{ fontSize: '14px', color: 'var(--error)', fontWeight: '600' }}>❌ Error: {errorMsg}</p>
                </div>
            )}
        </div>
    );
}

// Table row helper — modern table styling
function Row({
    label,
    value,
    truncate,
    highlight,
}: {
    label: string;
    value: string;
    truncate?: boolean;
    highlight?: 'red' | 'green';
}) {
    const displayValue = truncate && value.length > 24
        ? `${value.slice(0, 12)}...${value.slice(-12)}`
        : value;

    let valueColor = 'var(--text-secondary)';
    let fontWeight = '400';
    if (highlight === 'red') { valueColor = 'var(--error)'; fontWeight = '600'; }
    if (highlight === 'green') { valueColor = 'var(--success)'; fontWeight = '600'; }

    return (
        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <td style={{
                padding: '12px 16px',
                color: 'var(--text-tertiary)',
                width: '140px',
                fontSize: '13px',
                fontWeight: '500',
            }}>
                {label}
            </td>
            <td style={{
                padding: '12px 16px',
                color: valueColor,
                fontWeight: fontWeight,
                fontFamily: 'var(--font-mono)',
            }} title={value}>
                {displayValue}
            </td>
        </tr>
    );
}
