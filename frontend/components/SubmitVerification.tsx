'use client';

// Blockchain'e gerçek doğrulama gönderimi
// Real verification submission to blockchain

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
        <div className="border-2 border-black p-4 bg-white space-y-3">
            <button
                onClick={handleSubmit}
                disabled={status === 'submitting' || !walletAddress}
                className="border-2 border-black bg-white px-4 py-2 font-bold hover:bg-gray-100 transition-colors w-full disabled:opacity-50"
            >
                {status === 'submitting' ? 'Submitting...' : 'Submit Verification to Blockchain'}
            </button>

            {!walletAddress && (
                <p className="text-sm font-mono text-red-600">⚠️ Connect wallet first</p>
            )}

            {status === 'success' && txHash && (
                <div className="font-mono text-sm space-y-1">
                    <p className="text-green-700">✅ Transaction confirmed</p>
                    <p className="text-xs break-all">TX: {txHash}</p>
                    <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs"
                    >
                        View on Stellar Expert →
                    </a>
                </div>
            )}

            {status === 'error' && errorMsg && (
                <p className="text-sm font-mono text-red-600">❌ {errorMsg}</p>
            )}
        </div>
    );
}
