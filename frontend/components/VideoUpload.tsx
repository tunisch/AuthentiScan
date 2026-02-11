'use client';

import { useState } from 'react';
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
    const [error, setError] = useState<string>('');
    const [url, setUrl] = useState('');

    const handleFile = async (file: File) => {
        if (!isConnected) {
            setError('Please connect your wallet to analyze content');
            return;
        }
        setError('');
        if (!file) return;

        if (!isVideoFile(file)) {
            setError('Incompatible format. Select valid video.');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateVideoHash(file);
            onHashed(hash);
            const result = await analyzeVideo(file);
            onAnalyzed(result);
        } catch (err) {
            setError('Analysis failed');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrl = async () => {
        if (!isConnected) {
            setError('Connect wallet to use URL analysis');
            return;
        }
        setError('');
        if (!url.trim() || !isValidUrl(url)) {
            setError('Invalid URL provided');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateUrlHash(url);
            onHashed(hash);
            const result = await analyzeVideoUrl(url);
            onAnalyzed(result);
        } catch (err) {
            setError('URL Analysis failed');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="retro-panel" style={{ position: 'relative' }}>
            {!isConnected && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '20px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(3px)'
                }}>
                    <span style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</span>
                    <p style={{ color: 'var(--accent-orange)', fontWeight: '800', fontSize: '18px', textShadow: '0 0 10px rgba(255,107,0,0.5)' }}>
                        WALLET CONNECTION REQUIRED
                    </p>
                    <p style={{ color: 'white', fontSize: '14px', marginTop: '5px' }}>
                        Access denied. Connect to Stellar to scan.
                    </p>
                </div>
            )}

            <h3 className="text-neon-orange" style={{
                fontSize: '24px',
                fontWeight: '900',
                marginBottom: '20px',
                letterSpacing: '1px'
            }}>
                &gt; INITIALIZE SCANNER_
            </h3>

            <div style={{
                display: 'flex',
                background: '#000',
                padding: '4px',
                border: '1px solid #333',
                marginBottom: '20px',
            }}>
                <button
                    onClick={() => setMode('file')}
                    style={{
                        flex: 1, padding: '12px', background: mode === 'file' ? 'var(--accent-cyan)' : 'transparent',
                        color: mode === 'file' ? 'black' : 'var(--accent-cyan)',
                        border: 'none', fontWeight: '800', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    FILE_MODE
                </button>
                <button
                    onClick={() => setMode('url')}
                    style={{
                        flex: 1, padding: '12px', background: mode === 'url' ? 'var(--accent-cyan)' : 'transparent',
                        color: mode === 'url' ? 'black' : 'var(--accent-cyan)',
                        border: 'none', fontWeight: '800', cursor: 'pointer', transition: 'all 0.1s'
                    }}
                >
                    URL_LINK_MODE
                </button>
            </div>

            {mode === 'file' && (
                <div style={{
                    border: '2px dashed var(--accent-cyan)',
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 10px rgba(0,245,255,0.1)'
                }}>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        disabled={isProcessing || !isConnected}
                        style={{ display: 'none' }}
                        id="video-input"
                    />
                    <label htmlFor="video-input" style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                        <p className="text-neon" style={{ fontWeight: '800', fontSize: '18px' }}>UPLOAD ENCRYPTED_STREAM</p>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>*.MP4, *.MOV_MAX(50MB)</p>
                    </label>
                </div>
            )}

            {mode === 'url' && (
                <div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="INPUT_SOURCE_URL://"
                        disabled={isProcessing || !isConnected}
                        style={{
                            width: '100%', padding: '15px', background: '#000', border: '1px solid var(--accent-cyan)',
                            color: 'var(--accent-cyan)', fontSize: '16px', outline: 'none', fontFamily: 'var(--font-mono)'
                        }}
                    />
                    <button
                        onClick={handleUrl}
                        disabled={isProcessing || !url.trim() || !isConnected}
                        className="btn-retro"
                        style={{ marginTop: '15px', width: '100%' }}
                    >
                        {isProcessing ? 'SCANNING_SOURCE...' : 'EXECUTE_QUERY'}
                    </button>
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: '20px', padding: '10px', background: 'rgba(255,0,0,0.1)',
                    border: '1px solid var(--error)', color: 'var(--error)', fontWeight: 'bold', fontSize: '13px'
                }}>
                    [SYSTEM_ERR]: {error.toUpperCase()}
                </div>
            )}
        </div>
    );
}
