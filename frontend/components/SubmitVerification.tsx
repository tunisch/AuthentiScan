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
            setErrorMsg('WALLET_NOT_CONNECTED_SIG_DENIED');
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
            onSubmitted?.();
        } catch (err: any) {
            setErrorMsg(err.message || 'XDR_SUBMISSION_FAILED');
            setStatus('error');
        }
    };

    return (
        <div className="retro-panel">
            <h4 className="text-neon" style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px' }}>
                &gt; COMMIT_TO_LEDGER
            </h4>

            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '20px', lineHeight: '1.4' }}>
                Anchor this analysis on-chain. Immutable decentralized proof ensures digital integrity.
            </p>

            <button
                onClick={handleSubmit}
                disabled={status === 'submitting' || !walletAddress}
                className="btn-retro"
                style={{
                    width: '100%',
                    borderColor: status === 'error' ? 'var(--error)' : 'var(--accent-orange)',
                    color: status === 'error' ? 'var(--error)' : (status === 'submitting' ? '#333' : 'var(--accent-orange)')
                }}
            >
                {status === 'submitting' ? 'WRITING_TO_STELLAR...' : 'PUSH_TO_MAINNET_PROOF'}
            </button>

            {status === 'success' && txHash && (
                <div style={{
                    marginTop: '20px', padding: '15px', background: '#000', border: '1px solid var(--success)',
                    boxShadow: '0 0 10px rgba(57, 255, 20, 0.2)'
                }}>
                    <p style={{ fontWeight: '900', color: 'var(--success)', marginBottom: '5px', fontSize: '14px' }}>
                        [OK] REGISTRATION_SUCCESSFUL
                    </p>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                        TX_ID: {txHash}
                    </p>
                    <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '900', textDecoration: 'none',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}
                    >
                        &gt; VIEW_BLOCK_EXPLORER
                    </a>
                </div>
            )}

            {status === 'error' && errorMsg && (
                <p style={{
                    marginTop: '15px', fontSize: '12px', color: 'var(--error)', fontWeight: '900',
                    textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '8px'
                }}>
                    [SYSTEM_FAULT]: {errorMsg.toUpperCase()}
                </p>
            )}
        </div>
    );
}
