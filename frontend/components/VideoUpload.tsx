'use client';

import { useState, useEffect } from 'react';
import { calculateVideoHash, isVideoFile } from '@/lib/hash';
import { analyzeVideo, analyzeVideoUrl } from '@/lib/mockAi';
import { calculateUrlHash, isValidUrl } from '@/lib/urlHash';

interface VideoUploadProps {
    onHashed: (hash: string) => void;
    onAnalyzed: (result: any) => void;
    isConnected: boolean;
}

type UploadMode = 'file' | 'url';

export default function VideoUpload({ onHashed, onAnalyzed, isConnected }: VideoUploadProps) {
    const [mode, setMode] = useState<UploadMode>('file');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string>('');
    const [url, setUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Simulated Progress Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcessing) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev;
                    return prev + Math.random() * 15;
                });
            }, 300);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const handleFile = async (file: File) => {
        if (!isConnected) return;
        setError('');
        if (!file) return;

        if (!isVideoFile(file)) {
            setError('Incompatible format. Please select a valid video file.');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateVideoHash(file);
            onHashed(hash);
            const result = await analyzeVideo(file);
            setProgress(100);
            setTimeout(() => onAnalyzed(result), 400);
        } catch (err) {
            setError('Analysis failed. Please try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrl = async () => {
        if (!isConnected) return;
        setError('');
        if (!url.trim() || !isValidUrl(url)) {
            setError('Please provide a valid video URL.');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateUrlHash(url);
            onHashed(hash);
            const result = await analyzeVideoUrl(url);
            setProgress(100);
            setTimeout(() => onAnalyzed(result), 400);
        } catch (err) {
            setError('URL Analysis failed.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass-card" style={{
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {!isConnected && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(11, 15, 20, 0.85)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '30px',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'rgba(255, 106, 0, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px', border: '1px solid rgba(255,106,0,0.3)'
                    }}>
                        <span style={{ fontSize: '24px' }}>🔒</span>
                    </div>
                    <h3 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>
                        Connect Wallet to Initialize
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px' }}>
                        To prevent API abuse and ensure data integrity, a wallet connection is required for analysis.
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: 'white' }}>
                    01. SOURCE_SELECTION
                </h3>
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px'
                }}>
                    <button
                        onClick={() => setMode('file')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: mode === 'file' ? 'var(--brand-orange)' : 'transparent',
                            color: mode === 'file' ? 'black' : 'var(--text-secondary)',
                            fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: '0.2s'
                        }}
                    >LOCAL_FILE</button>
                    <button
                        onClick={() => setMode('url')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: mode === 'url' ? 'var(--brand-orange)' : 'transparent',
                            color: mode === 'url' ? 'black' : 'var(--text-secondary)',
                            fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: '0.2s'
                        }}
                    >REMOTE_URL</button>
                </div>
            </div>

            {mode === 'file' ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); }}
                    style={{
                        border: `2px dashed ${isDragging ? 'var(--brand-orange)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '16px',
                        padding: '48px 30px',
                        textAlign: 'center',
                        background: isDragging ? 'rgba(255,106,0,0.05)' : 'rgba(255,255,255,0.01)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {isProcessing && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(11, 15, 20, 0.9)', zIndex: 5,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div className="scan-layer" />
                            <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand-orange)', transition: 'width 0.3s ease' }} />
                            </div>
                            <p style={{ color: 'white', fontWeight: '900', fontSize: '14px', letterSpacing: '2px' }}>
                                SCANNING_FRAMES: {Math.round(progress)}%
                            </p>
                        </div>
                    )}

                    <input
                        type="file" accept="video/*" id="video-upload"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        disabled={isProcessing}
                    />
                    <label htmlFor="video-upload" style={{ cursor: isProcessing ? 'wait' : 'pointer' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
                        <p style={{ fontWeight: '800', color: 'white', fontSize: '16px' }}>
                            {isProcessing ? 'ANALYTICS_IN_PROGRESS...' : 'DRAG & DROP VIDEO SOURCE'}
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '8px' }}>
                            MP4, MOV or AVI up to 50MB
                        </p>
                    </label>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="https://video-source-endpoint.com/v/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isProcessing}
                            style={{
                                width: '100%', padding: '16px 20px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '15px', outline: 'none', transition: '0.2s'
                            }}
                        />
                        {isProcessing && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(11, 15, 20, 0.9)', zIndex: 5, borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <p style={{ color: 'white', fontWeight: '900', fontSize: '12px', letterSpacing: '2px' }}>
                                    URL_MAPPING: {Math.round(progress)}%
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-premium"
                        onClick={handleUrl}
                        disabled={isProcessing || !url.trim()}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {isProcessing ? 'SCANNING_ENDPOINT...' : 'INITIALIZE_URL_QUERY'}
                    </button>
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: '20px', padding: '14px', borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: 'var(--error)', fontSize: '13px', fontWeight: '700', display: 'flex', gap: '10px'
                }}>
                    <span>⚠️</span> {error}
                </div>
            )}
        </div>
    );
}
