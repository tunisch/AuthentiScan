'use client';

import { useEffect, useState } from 'react';
import { getLatestEvents } from '@/lib/soroban';

interface VerificationEvent {
    id: string;
    ledger: number;
    recordId: number;
    videoHash: string;
    submitter: string;
}

export default function RealTimeFeed() {
    const [events, setEvents] = useState<VerificationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const latestEvents = await getLatestEvents();
            // Map the raw data to the interface
            const formattedEvents: VerificationEvent[] = latestEvents.map(e => ({
                id: e.id,
                ledger: e.ledger,
                recordId: e.recordId,
                videoHash: e.videoHash,
                submitter: e.submitter
            }));

            setEvents(formattedEvents);
            setIsLoading(false);
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, []);

    if (isLoading && events.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '24px', opacity: 0.6 }}>
                <p style={{ fontSize: '12px', letterSpacing: '2px', fontWeight: '900' }}>INITIALIZING_LIVE_FEED...</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-orange)' }} />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', letterSpacing: '2px' }}>LIVE_ANCHOR_STREAM</h3>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '800' }}>TOTAL_EVENTS: {events.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.length === 0 ? (
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>
                        NO_RECENT_BLOCKCHAIN_ACTIVITY_FOUND
                    </p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="event-item" style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '8px',
                            borderLeft: '2px solid var(--brand-orange)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--brand-orange)' }}>
                                    #{event.recordId} ANCHORED
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                                    L_{event.ledger}
                                </span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                HASH: {event.videoHash.slice(0, 24)}...
                            </div>
                            <div style={{ fontSize: '9px', color: 'var(--accent-cyan)', marginTop: '4px', fontWeight: '700' }}>
                                AUDITOR: {event.submitter.slice(0, 6)}...{event.submitter.slice(-4)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .pulse-dot {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 106, 0, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 106, 0, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 106, 0, 0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
