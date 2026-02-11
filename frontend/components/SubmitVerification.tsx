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
                setTxState('success');
                onSubmitted();
            }, 1500);

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
            <div className="glass-card animate-premium" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    <span style={{ fontSize: '32px' }}>✅</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>PROOF_ANCHORED_SUCCESSFULLY</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    The cryptographic proof of this analysis has been permanently anchored to the Stellar Testnet.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                        padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                        fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)',
                        wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <span style={{ flex: 1 }}>TX: {txHash.slice(0, 32)}...</span>
                        <button
                            onClick={() => copyToClipboard(txHash)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >📋</button>
                    </div>

                    <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        style={{
                            fontSize: '12px', color: 'var(--brand-orange)', fontWeight: '800',
                            textDecoration: 'none', letterSpacing: '1px'
                        }}
                    >
                        VIEW_ON_STELLAR_EXPLORER ↗
                    </a>
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
