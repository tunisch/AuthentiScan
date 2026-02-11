'use client';

import { useState } from 'react';
import { submitVerification } from '@/lib/soroban';

interface SubmitVerificationProps {
    analysis: {
        is_ai_generated: boolean;
        confidence_score: number;
    };
    videoHash: string;
    walletAddress: string | null;
    signTransaction: (txXdr: string, opts: { networkPassphrase: string }) => Promise<string>;
    onSubmitted: () => void;
}

type TxState = 'idle' | 'signing' | 'broadcasting' | 'confirming' | 'success';

export default function SubmitVerification({
    analysis,
    videoHash,
    walletAddress,
    signTransaction,
    onSubmitted,
}: SubmitVerificationProps) {
    const [txState, setTxState] = useState<TxState>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [recordId, setRecordId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!walletAddress) {
            setError('Please connect your wallet first.');
            return;
        }

        setError(null);
        setTxState('signing');

        try {
            // The lib/soroban.ts function handles internal steps, 
            // but we'll simulate granular status for UX perception.
            const result = await submitVerification(
                walletAddress,
                videoHash,
                analysis.is_ai_generated,
                analysis.confidence_score,
                async (xdr, opts) => {
                    const signed = await signTransaction(xdr, opts);
                    setTxState('broadcasting');
                    return signed;
                },
            );

            setTxState('confirming');
            // Small delay to simulate ledger confirmation
            setTimeout(() => {
                setTxHash(result.txHash);
                if (result.recordId) setRecordId(result.recordId);
                // Trigger animation sequence
                setTxState('success');
                onSubmitted();
            }, 2500); // Slightly longer for the visual 'pulse' to feel weightier

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Transaction submission failed.');
            setTxState('idle');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    if (txState === 'success' && txHash) {
        return (
            <div className="glass-card animate-premium" style={{
                padding: '0',
                textAlign: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(255,106,0,0.2)',
                background: 'linear-gradient(135deg, rgba(255,106,0,0.05) 0%, rgba(11, 15, 20, 1) 100%)'
            }}>
                <div style={{
                    padding: '32px',
                    position: 'relative'
                }}>
                    {/* Success Glow Animation */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,106,0,0.15) 0%, transparent 70%)',
                        zIndex: 0
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--brand-orange)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                            boxShadow: '0 0 30px rgba(255,106,0,0.4)',
                            animation: 'pulseGlow 2s infinite'
                        }}>
                            <span style={{ fontSize: '32px', color: 'black' }}>✓</span>
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '8px', letterSpacing: '2px' }}>
                            ANCHORED_TO_LEDGER
                        </h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px' }}>
                            DATA_IMMUTABILITY_ESTABLISHED
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recordId && (
                                <div style={{
                                    padding: '16px', background: 'rgba(255,106,0,0.05)', borderRadius: '12px',
                                    border: '1px solid rgba(255,106,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-tertiary)' }}>ANCHOR_ID</span>
                                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--brand-orange)', fontFamily: 'var(--font-mono)' }}>#{recordId}</span>
                                </div>
                            )}

                            <div style={{
                                padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)',
                                wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '10px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <span style={{ flex: 1 }}>TX: {txHash.slice(0, 32)}...</span>
                                <button
                                    onClick={() => copyToClipboard(txHash)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                >📋</button>
                            </div>

                            {/* Contract ID Display for Audit Transparency */}
                            <div style={{
                                padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)',
                                border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center'
                            }}>
                                CONTRACT: {process.env.NEXT_PUBLIC_CONTRACT_ID?.slice(0, 8)}...{process.env.NEXT_PUBLIC_CONTRACT_ID?.slice(-8)}
                            </div>

                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '12px', color: 'var(--brand-orange)', fontWeight: '800',
                                    textDecoration: 'none', letterSpacing: '1px', marginTop: '10px',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                }}
                            >
                                VIEW_ON_STELLAR_EXPLORER ↗
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card animate-premium" style={{ padding: '32px', position: 'relative' }}>
            {txState !== 'idle' && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(11, 15, 20, 0.9)', zIndex: 10, borderRadius: 'var(--radius-lg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid var(--brand-orange)', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', marginBottom: '20px'
                    }} />
                    <p style={{ color: 'white', fontWeight: '900', fontSize: '14px', letterSpacing: '2px' }}>
                        {txState === 'signing' && 'AWAITING_WALLET_SIGNATURE...'}
                        {txState === 'broadcasting' && 'BROADCASTING_TO_TESTNET...'}
                        {txState === 'confirming' && 'WAITING_FOR_LEDGER_CONFIRMATION...'}
                    </p>
                    <style jsx>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: 'white' }}>
                        03. LEDGER_IMMUTABILITY
                    </h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                        Anchor analysis data to Stellar Testnet
                    </p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.05)',
                    border: '1px solid rgba(0, 229, 255, 0.1)'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '900' }}>STELLAR_READY</span>
                </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
                Anchoring this analysis creates a public record of truth. This prevents tampering and allows anyone to verify the video's status independently using the cryptographic hash.
            </p>

            <button
                className="btn-premium"
                onClick={handleSubmit}
                disabled={txState !== 'idle' || !walletAddress}
                style={{ width: '100%', justifyContent: 'center' }}
            >
                {txState !== 'idle' ? 'PROCESSING...' : 'COMMIT_PROOF_TO_LEDGER'}
            </button>

            {error && (
                <div style={{
                    marginTop: '20px', padding: '14px', borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: 'var(--error)', fontSize: '13px', fontWeight: '700'
                }}>
                    ERROR_IDENTIFIED: {error}
                </div>
            )}
        </div>
    );
}
