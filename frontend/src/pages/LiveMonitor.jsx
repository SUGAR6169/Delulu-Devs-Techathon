import { useEffect, useState } from 'react';
import PowerTrend from '../components/PowerTrend';
import PowerMeter from '../components/PowerMeter';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function LiveMonitor() {
    const [powerSummary, setPowerSummary] = useState(null);
    const [powerHistory, setPowerHistory] = useState([]);
    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
            setPowerSummary(data);
            if (data?.total_watts !== undefined) {
                const now = Date.now();
                setPowerHistory(Array.from({ length: 15 }, (_, i) => ({
                    timestamp: new Date(now - (14 - i) * 10000).toISOString(),
                    watts: data.total_watts
                })));
            }
        });
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'state_update') {
            fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
                setPowerSummary(data);
                if (data?.total_watts !== undefined) {
                    setPowerHistory(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        watts: data.total_watts
                    }].slice(-50));
                }
            });
        }
    }, [wsMessages]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Live Monitor</h2>
            <PowerMeter summary={powerSummary} />
            <div className="glass-panel h-96 p-4">
                <PowerTrend history={powerHistory} />
            </div>
            {powerSummary && (
                <div className="glass-panel p-6">
                    <h3 className="text-sm uppercase tracking-widest text-indigo-300/70 mb-4">Room Breakdown (Live)</h3>
                    <div className="space-y-4">
                        {Object.entries(powerSummary.rooms_watts || {}).map(([room, watts]) => (
                            <div key={room}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300">{room}</span>
                                    <span className="font-mono text-white">{watts.toFixed(1)} W</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${Math.min(100, (watts / (powerSummary.total_watts || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}