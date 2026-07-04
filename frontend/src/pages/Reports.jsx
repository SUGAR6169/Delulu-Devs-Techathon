import { useEffect, useState } from 'react';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CustomTooltip({ active, payload, label, unit, color }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-[#161923] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-[10px] text-slate-400 mb-1">{formatTime(label)}</p>
            <p className="text-sm font-mono font-semibold" style={{ color }}>
                {payload[0].value.toFixed(unit === 'kWh' ? 3 : 1)} {unit}
            </p>
        </div>
    );
}

function BigPowerTrend({ history = [] }) {
    const current = history.length > 0 ? history[history.length - 1].watts : null;

    return (
        <div className="glass-panel w-full h-80 flex flex-col bg-[#0B0D14] border-t-2 border-t-yellow-500/20 shadow-inner p-5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
                    <Activity size={16} className="text-warning" /> Live Power Trend
                </h2>
                {current !== null && (
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                        <span className="font-mono text-xs font-semibold text-yellow-500/90">{current.toFixed(1)} W</span>
                    </div>
                )}
            </div>

            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradient-trend-big" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
                                <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTime}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            minTickGap={40}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            width={40}
                            tickFormatter={(v) => `${v}W`}
                        />
                        <Tooltip content={<CustomTooltip unit="W" color="rgb(250, 204, 21)" />} />
                        <Area
                            type="monotone"
                            dataKey="watts"
                            stroke="rgb(250, 204, 21)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#gradient-trend-big)"
                            isAnimationActive={false}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#0B0D14' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function BigKwhTrend({ history = [] }) {
    const current = history.length > 0 ? history[history.length - 1].kwh : null;

    return (
        <div className="glass-panel w-full h-80 flex flex-col bg-[#0B0D14] border-t-2 border-t-emerald-500/20 shadow-inner p-5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" /> kWh Usage Over Time
                </h2>
                {current !== null && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-mono text-xs font-semibold text-emerald-400/90">{current.toFixed(3)} kWh</span>
                    </div>
                )}
            </div>

            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradient-kwh-big" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(52, 211, 153, 0.4)" />
                                <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTime}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            minTickGap={40}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            width={45}
                            tickFormatter={(v) => `${v.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip unit="kWh" color="rgb(52, 211, 153)" />} />
                        <Area
                            type="monotone"
                            dataKey="kwh"
                            stroke="rgb(52, 211, 153)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#gradient-kwh-big)"
                            isAnimationActive={false}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#0B0D14' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function Reports() {
    const [summary, setSummary] = useState(null);
    const [powerHistory, setPowerHistory] = useState([]);
    const [kwhHistory, setKwhHistory] = useState([]);
    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
            setSummary(data);
            const now = Date.now();
            if (data?.total_watts !== undefined) {
                setPowerHistory(Array.from({ length: 15 }, (_, i) => ({
                    timestamp: new Date(now - (14 - i) * 10000).toISOString(),
                    watts: data.total_watts
                })));
            }
            if (data?.estimated_kwh !== undefined) {
                setKwhHistory(Array.from({ length: 15 }, (_, i) => ({
                    timestamp: new Date(now - (14 - i) * 10000).toISOString(),
                    kwh: data.estimated_kwh
                })));
            }
        });
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'state_update') {
            fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
                setSummary(data);
                if (data?.total_watts !== undefined) {
                    setPowerHistory(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        watts: data.total_watts
                    }].slice(-50));
                }
                if (data?.estimated_kwh !== undefined) {
                    setKwhHistory(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        kwh: data.estimated_kwh
                    }].slice(-50));
                }
            });
        }
    }, [wsMessages]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-indigo-400" /> Reports
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <BigPowerTrend history={powerHistory} />
                <BigKwhTrend history={kwhHistory} />
            </div>

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