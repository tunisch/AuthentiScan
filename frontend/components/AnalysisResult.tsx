'use client';

/**
 * Analysis Result Display Component
 * 
 * AI analiz sonuçlarını gösterir
 * Displays AI analysis results
 */

interface AnalysisResultProps {
    analysis: {
        is_ai_generated: boolean;
        confidence_score: number;
        analysis_time_ms: number;
    };
    videoHash: string;
}

export default function AnalysisResult({ analysis, videoHash }: AnalysisResultProps) {
    return (
        <div className="border-2 border-black p-4 bg-white">
            <h3 className="font-bold mb-3 uppercase">Analysis Result</h3>

            <div className="space-y-2 font-mono text-sm">
                <p>
                    <strong>Video Hash:</strong> {videoHash.slice(0, 16)}...{videoHash.slice(-16)}
                </p>
                <p>
                    <strong>AI Generated:</strong> {analysis.is_ai_generated ? 'Yes' : 'No'}
                </p>
                <p>
                    <strong>Confidence:</strong> {analysis.confidence_score}%
                </p>
                <p className="text-gray-600">
                    <strong>Analysis Time:</strong> {analysis.analysis_time_ms}ms
                </p>
            </div>
        </div>
    );
}
