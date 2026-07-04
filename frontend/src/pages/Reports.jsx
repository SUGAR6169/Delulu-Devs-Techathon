import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function Reports() {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(setSummary);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-indigo-400" /> Reports
            </h2>
            {summary ? (
                <div className="glass-panel p-6 space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500">Today's Estimated Usage</p>
                        <p className="text-3xl font-bold text-white mt-1">{summary.estimated_kwh?.toFixed(3)} kWh</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Consumption by Room</p>
                        <div className="space-y-3">
                            {Object.entries(summary.rooms_watts || {}).map(([room, watts]) => (
                                <div key={room} className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-sm text-slate-300">{room}</span>
                                    <span className="font-mono text-sm text-white">{watts.toFixed(1)} W</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-slate-500">Loading report data...</p>
            )}
        </div>
    );
}