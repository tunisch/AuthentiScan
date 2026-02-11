'use client';

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
        <div className="glass" style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
        }}>
            <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--text-primary)',
            }}>
                Analysis Result
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {/* Video Hash */}
                <div>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                        marginBottom: '4px',
                    }}>
                        Video Hash
                    </p>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        wordBreak: 'break-all',
                    }}>
                        {videoHash.slice(0, 16)}...{videoHash.slice(-16)}
                    </p>
                </div>

                {/* AI Generated */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: analysis.is_ai_generated
                        ? 'rgba(255, 69, 58, 0.1)'
                        : 'rgba(48, 209, 88, 0.1)',
                    border: `1px solid ${analysis.is_ai_generated ? 'var(--error)' : 'var(--success)'}`,
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                        marginBottom: '4px',
                    }}>
                        AI Generated
                    </p>
                    <p style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: analysis.is_ai_generated ? 'var(--error)' : 'var(--success)',
                    }}>
                        {analysis.is_ai_generated ? '⚠️ Yes' : '✓ No'}
                    </p>
                </div>

                {/* Confidence Score */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                    }}>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                        }}>
                            Confidence Score
                        </p>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                        }}>
                            {analysis.confidence_score}%
                        </p>
                    </div>
                    <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'var(--bg-tertiary)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${analysis.confidence_score}%`,
                            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-violet) 100%)',
                            transition: 'width 0.8s ease-out',
                        }} />
                    </div>
                </div>

                {/* Analysis Time */}
                <p style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    Analysis completed in {analysis.analysis_time_ms}ms
                </p>
            </div>
        </div>
    );
}
