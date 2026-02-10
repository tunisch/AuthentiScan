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
        <div className="border-2 border-black p-4 bg-white space-y-4">
            <div className="flex items-center justify-between">
                <p className="font-bold uppercase">On-Chain Verification Record</p>
                {queryTime && status === 'found' && (
                    <span className="text-xs font-mono text-gray-400">query: {queryTime}</span>
                )}
            </div>

            <button
                onClick={handleQuery}
                disabled={!videoHash || !walletAddress || status === 'loading'}
                className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 transition-colors w-full disabled:opacity-50"
            >
                {status === 'loading' ? 'Querying blockchain...' : 'Read Verification from Blockchain'}
            </button>

            {!walletAddress && (
                <p className="text-sm font-mono text-gray-500">Connect wallet to query</p>
            )}
            {!videoHash && walletAddress && (
                <p className="text-sm font-mono text-gray-500">Upload a video first</p>
            )}

            {/* ── LOADING ── */}
            {status === 'loading' && (
                <div className="border border-gray-300 p-4 text-center">
                    <p className="font-mono text-sm">⏳ Reading from Stellar Testnet...</p>
                </div>
            )}

            {/* ── FOUND — Academic proof table ── */}
            {status === 'found' && record && (
                <div className="border border-black">
                    {/* Header */}
                    <div className="bg-black text-white px-3 py-2">
                        <p className="font-bold text-sm uppercase tracking-wide">
                            ✅ Blockchain Verification Proof
                        </p>
                    </div>

                    {/* Data table */}
                    <table className="w-full font-mono text-sm">
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
                        <div className="border-t border-gray-300 px-3 py-2 text-xs text-gray-500 font-mono">
                            Total on-chain verifications: {totalCount}
                        </div>
                    )}
                </div>
            )}

            {/* ── NOT FOUND ── */}
            {status === 'not_found' && (
                <div className="border border-gray-300 p-4">
                    <p className="font-mono text-sm text-yellow-700">⚠️ No record found</p>
                    <p className="font-mono text-xs text-gray-500 mt-1">
                        No verification exists for this video hash + wallet combination.
                    </p>
                    {totalCount !== null && (
                        <p className="font-mono text-xs text-gray-500 mt-1">
                            Total on-chain verifications: {totalCount}
                        </p>
                    )}
                </div>
            )}

            {/* ── ERROR ── */}
            {status === 'error' && errorMsg && (
                <div className="border border-red-300 bg-red-50 p-4">
                    <p className="font-mono text-sm text-red-700">❌ Error: {errorMsg}</p>
                </div>
            )}
        </div>
    );
}

// Table row helper — clean, screenshot-ready layout
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

    let valueClass = 'text-gray-900';
    if (highlight === 'red') valueClass = 'text-red-600 font-bold';
    if (highlight === 'green') valueClass = 'text-green-700 font-bold';

    return (
        <tr className="border-t border-gray-200">
            <td className="px-3 py-2 text-gray-500 whitespace-nowrap w-36">{label}</td>
            <td className={`px-3 py-2 break-all ${valueClass}`} title={value}>
                {displayValue}
            </td>
        </tr>
    );
}
