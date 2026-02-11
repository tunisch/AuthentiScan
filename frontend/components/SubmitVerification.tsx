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
    onSubmitted?: () => void;
}

export default function SubmitVerification({
    analysis,
    videoHash,
    walletAddress,
    signTransaction,
    onSubmitted,
}: SubmitVerificationProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!walletAddress) {
            setErrorMsg('Wallet not connected');
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMsg(null);

        try {
            const result = await submitVerification(
                walletAddress,
                videoHash,
                analysis.is_ai_generated,
                analysis.confidence_score,
                signTransaction,
            );

            setTxHash(result.txHash);
            setStatus('success');
            console.log('✅ On-chain verification submitted:', result.txHash);
            onSubmitted?.();
        } catch (err: any) {
            console.error('❌ Submission error:', err);
            setErrorMsg(err.message || 'Unknown error');
            setStatus('error');
        }
    };

    return (
        <div className="glass" style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
        }}>
            <button
                onClick={handleSubmit}
                disabled={status === 'submitting' || !walletAddress}
                className="animate-glow"
                style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: status === 'submitting' || !walletAddress
                        ? 'var(--bg-tertiary)'
                        : 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: status === 'submitting' || !walletAddress ? 'not-allowed' : 'pointer',
                    opacity: status === 'submitting' || !walletAddress ? 0.5 : 1,
                    transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                    if (status !== 'submitting' && walletAddress) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {status === 'submitting' ? '⏳ Submitting to Blockchain...' : 'Submit Verification to Blockchain'}
            </button>

            {!walletAddress && (
                <p style={{
                    marginTop: 'var(--spacing-md)',
                    fontSize: '14px',
                    color: 'var(--error)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    ⚠️ Connect wallet first
                </p>
            )}

            {status === 'success' && txHash && (
                <div style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(48, 209, 88, 0.1)',
                    border: '1px solid var(--success)',
                }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--success)',
                        marginBottom: '8px',
                    }}>
                        ✅ Transaction confirmed
                    </p>
                    <p style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        wordBreak: 'break-all',
                        marginBottom: '8px',
                    }}>
                        TX: {txHash}
                    </p>
                    <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '14px',
                            color: 'var(--accent-blue)',
                            textDecoration: 'underline',
                        }}
                    >
                        View on Stellar Expert →
                    </a>
                </div>
            )}

            {status === 'error' && errorMsg && (
                <p style={{
                    marginTop: 'var(--spacing-md)',
                    fontSize: '14px',
                    color: 'var(--error)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    ❌ {errorMsg}
                </p>
            )}
        </div>
    );
}
