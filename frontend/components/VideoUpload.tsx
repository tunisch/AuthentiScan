'use client';

import { useState } from 'react';
import { calculateVideoHash, isVideoFile } from '@/lib/hash';
import { analyzeVideo } from '@/lib/mockAi';

/**
 * Video Upload Component
 * 
 * Video yükleme ve analiz
 * Video upload and analysis
 */

interface VideoUploadProps {
    onHashed: (hash: string) => void;
    onAnalyzed: (result: any) => void;
}

export default function VideoUpload({ onHashed, onAnalyzed }: VideoUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFile = async (file: File) => {
        setError('');

        if (!file) return;

        // Video dosyası kontrolü
        if (!isVideoFile(file)) {
            setError('Please select a valid video file');
            return;
        }

        // Dosya boyutu kontrolü (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Video file too large (max 50MB)');
            return;
        }

        setIsProcessing(true);

        try {
            // Video hash hesaplanır (blockchain için temel veri)
            const hash = await calculateVideoHash(file);
            onHashed(hash);

            // Off-chain AI analizi (mock)
            const result = await analyzeVideo(file);
            onAnalyzed(result);
        } catch (err) {
            setError('Error processing video');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="border-2 border-black p-4 bg-white">
            <p className="font-bold mb-2 uppercase">Upload Video</p>

            <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                disabled={isProcessing}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-white file:font-bold hover:file:bg-gray-100"
            />

            {error && (
                <p className="mt-2 text-sm text-red-600">⚠️ {error}</p>
            )}

            {isProcessing && (
                <p className="mt-2 text-sm font-mono">Processing...</p>
            )}
        </div>
    );
}
