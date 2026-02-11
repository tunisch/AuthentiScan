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
    const statusColor = analysis.is_ai_generated ? 'var(--error)' : 'var(--success)';

    return (
        <div className="retro-panel" style={{
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="text-neon" style={{ fontSize: '20px', fontWeight: '900' }}>
                    // SCAN_REPORT_OUTPUT
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Result Indicator - High Contrast */}
                <div style={{
                    padding: '30px',
                    background: '#0a0a0a',
                    borderLeft: `5px solid ${statusColor}`,
                    borderRight: `5px solid ${statusColor}`,
                    textAlign: 'center',
                    boxShadow: `inset 0 0 20px ${statusColor}33`,
                }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px', letterSpacing: '2px' }}>VERDICT</p>
                    <p style={{
                        fontSize: '32px',
                        fontWeight: '950',
                        color: statusColor,
                        textShadow: `0 0 15px ${statusColor}`,
                        margin: 0,
                        textTransform: 'uppercase'
                    }}>
                        {analysis.is_ai_generated ? 'AI_GENERATED_DETECTED' : 'AUTHENTIC_DATA_STREAM'}
                    </p>
                </div>

                {/* Confidence Meter */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-cyan)' }}>PROBABILITY_ACCURACY</p>
                        <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)' }}>{analysis.confidence_score}.00%</p>
                    </div>
                    <div style={{
                        height: '15px',
                        background: '#000',
                        border: '1px solid #333',
                        position: 'relative'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${analysis.confidence_score}%`,
                            background: statusColor,
                            boxShadow: `0 0 10px ${statusColor}`,
                            transition: 'width 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        }} />
                    </div>
                </div>

                {/* Metadata - Retro Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#333', border: '1px solid #333'
                }}>
                    <div style={{ background: '#000', padding: '15px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '5px' }}>TIME_LAPSE</p>
                        <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{analysis.analysis_time_ms} ms</p>
                    </div>
                    <div style={{ background: '#000', padding: '15px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '5px' }}>DATA_DIGEST</p>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {videoHash.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
