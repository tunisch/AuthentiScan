'use client';

import { useState } from 'react';
import { calculateVideoHash, isVideoFile } from '@/lib/hash';
import { analyzeVideo, analyzeVideoUrl } from '@/lib/mockAi';
import { calculateUrlHash, isValidUrl } from '@/lib/urlHash';

interface VideoUploadProps {
    onHashed: (hash: string) => void;
    onAnalyzed: (result: any) => void;
}

type UploadMode = 'file' | 'url';

export default function VideoUpload({ onHashed, onAnalyzed }: VideoUploadProps) {
    const [mode, setMode] = useState<UploadMode>('file');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [url, setUrl] = useState('');

    const handleFile = async (file: File) => {
        setError('');
        if (!file) return;

        if (!isVideoFile(file)) {
            setError('Please select a valid video file');
            return;
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Video file too large (max 50MB)');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateVideoHash(file);
            onHashed(hash);

            const result = await analyzeVideo(file);
            onAnalyzed(result);
        } catch (err) {
            setError('Error processing video');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrl = async () => {
        setError('');

        if (!url.trim()) {
            setError('Please enter a video URL');
            return;
        }

        if (!isValidUrl(url)) {
            setError('Please enter a valid URL (must start with http:// or https://)');
            return;
        }

        setIsProcessing(true);

        try {
            const hash = await calculateUrlHash(url);
            onHashed(hash);

            const result = await analyzeVideoUrl(url);
            onAnalyzed(result);
        } catch (err) {
            setError('Error processing URL');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass" style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
        }}>
            <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--text-primary)',
            }}>
                Upload Video
            </h3>

            {/* Tab Buttons */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-md)',
                position: 'relative',
            }}>
                <button
                    onClick={() => setMode('file')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: mode === 'file' ? 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)' : 'var(--bg-secondary)',
                        color: mode === 'file' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                    }}
                >
                    📁 File Upload
                </button>
                <button
                    onClick={() => setMode('url')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: mode === 'url' ? 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)' : 'var(--bg-secondary)',
                        color: mode === 'url' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                    }}
                >
                    🔗 URL Upload
                </button>
            </div>

            {/* File Upload Mode */}
            {mode === 'file' && (
                <div>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        disabled={isProcessing}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-secondary)',
                            border: '2px dashed var(--glass-border)',
                            color: 'var(--text-primary)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                        }}
                    />
                    <p style={{
                        marginTop: 'var(--spacing-sm)',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                    }}>
                        Supported: MP4, MOV, AVI (max 50MB)
                    </p>
                </div>
            )}

            {/* URL Upload Mode */}
            {mode === 'url' && (
                <div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or direct video URL"
                        disabled={isProcessing}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '14px',
                        }}
                    />
                    <button
                        onClick={handleUrl}
                        disabled={isProcessing || !url.trim()}
                        style={{
                            marginTop: 'var(--spacing-md)',
                            padding: '12px 24px',
                            borderRadius: 'var(--radius-md)',
                            background: isProcessing || !url.trim() ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '600',
                            cursor: isProcessing || !url.trim() ? 'not-allowed' : 'pointer',
                            opacity: isProcessing || !url.trim() ? 0.5 : 1,
                            transition: 'all var(--transition-base)',
                        }}
                    >
                        Analyze URL
                    </button>
                    <p style={{
                        marginTop: 'var(--spacing-sm)',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                    }}>
                        Paste any video URL (YouTube, Vimeo, TikTok, direct links)
                    </p>
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    fontSize: '14px',
                    fontWeight: '500',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {isProcessing && (
                <div style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-sm)',
                    }}>
                        {mode === 'file' ? 'Processing video...' : 'Analyzing URL...'}
                    </p>
                    <div style={{
                        height: '4px',
                        borderRadius: '2px',
                        background: 'var(--bg-tertiary)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: '50%',
                            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}
