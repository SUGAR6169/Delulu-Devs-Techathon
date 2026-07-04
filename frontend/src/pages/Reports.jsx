import { useEffect, useState } from 'react';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';
const MAX_WATTS = 495; // highest possible total load — used as the fixed Y-axis ceiling
const DEMO_MODE = true; // seeds charts with a realistic-looking curve on load, for presentations

// Generates a wavy, believable-looking wattage curve for the past 6 hours,
// ending exactly at `endWatts` so it connects seamlessly to live data.
function generateDemoWattsHistory(nowMs, endWatts) {
    const points = [];
    const stepMs = 10 * 60 * 1000; // one point every 10 sim-minutes
    const totalSteps = 36; // 6 hours
    const base = Math.max(50, endWatts * 0.55);
    for (let i = 0; i <= totalSteps; i++) {
        const t = nowMs - (totalSteps - i) * stepMs;
        const progress = i / totalSteps;
        const wave = Math.sin(i / 3.2) * (endWatts * 0.12) + Math.sin(i / 1.3) * (endWatts * 0.04);
        const ramp = base + (endWatts - base) * progress;
        const watts = i === totalSteps ? endWatts : Math.max(20, ramp + wave);
        points.push({ timestamp: t, watts: Number(watts.toFixed(1)) });
    }
    return points;
}

// Generates a monotonically increasing kWh curve from midnight up to `endKwh`,
// mimicking realistic step-ups during "working hours".
function generateDemoKwhHistory(nowMs, endKwh) {
    const dayStart = new Date(nowMs);
    dayStart.setHours(0, 0, 0, 0);
    const points = [];
    const totalSteps = 48;
    const stepMs = (nowMs - dayStart.getTime()) / totalSteps;
    for (let i = 0; i <= totalSteps; i++) {
        const t = dayStart.getTime() + i * stepMs;
        const progress = i / totalSteps;
        // ease-in-ish curve so it looks like usage ramps up through the day
        const eased = Math.pow(progress, 1.15);
        const kwh = i === totalSteps ? endKwh : Number((eased * endKwh).toFixed(3));
        points.push({ timestamp: t, kwh });
    }
    return points;
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatHourOnly(ts) {
    const d = new Date(ts);
    const h = d.getHours();
    return h === 0 ? '12AM' : h === 12 ? '12PM' : h > 12 ? `${h - 12}PM` : `${h}AM`;
}

function toMs(ts) {
    return typeof ts === 'number' ? ts : new Date(ts).getTime();
}

// Rolling window: from 6 hours before the latest point, up to the latest (live) point.
function getSixHourDomain(chartData) {
    if (!chartData.length) {
        const now = Date.now();
        return [now - 6 * 60 * 60 * 1000, now];
    }
    const liveTime = chartData[chartData.length - 1].timestamp;
    return [liveTime - 6 * 60 * 60 * 1000, liveTime];
}

function getHourlyTicksInRange(domain) {
    const [start, end] = domain;
    const hourMs = 60 * 60 * 1000;
    const firstTick = Math.ceil(start / hourMs) * hourMs;
    const ticks = [];
    for (let t = firstTick; t <= end; t += hourMs) ticks.push(t);
    if (!ticks.length || ticks[ticks.length - 1] !== end) ticks.push(end);
    return ticks;
}

// Fixed full-day domain: midnight to midnight of the current data's day.
function getDayDomain(data) {
    if (!data.length) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return [start, start + 24 * 60 * 60 * 1000];
    }
    const first = new Date(toMs(data[0].timestamp));
    const start = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime();
    return [start, start + 24 * 60 * 60 * 1000];
}

function getDayTicks(domain) {
    const [start, end] = domain;
    const step = 2 * 60 * 60 * 1000;
    const ticks = [];
    for (let t = start; t <= end; t += step) ticks.push(t);
    return ticks;
}

// Tries common field names for a backend-provided simulated timestamp.
// Falls back to real wall-clock time if none are found.
function extractSimTime(obj) {
    if (!obj) return new Date().toISOString();
    const candidates = [
        obj.simulated_time,
        obj.sim_time,
        obj.simulation_time,
        obj.timestamp,
        obj.time,
        obj.data?.simulated_time,
        obj.data?.timestamp,
    ];
    const found = candidates.find(v => v !== undefined && v !== null);
    return found !== undefined ? found : new Date().toISOString();
}

// Projects today's total kWh based on the current rate of consumption
// (current kWh so far ÷ hours elapsed since midnight × 24).
function estimateDayTotalKwh(chartData, dayDomain) {
    if (!chartData.length) return null;
    const [dayStart] = dayDomain;
    const latest = chartData[chartData.length - 1];
    const elapsedHours = (latest.timestamp - dayStart) / (60 * 60 * 1000);
    if (elapsedHours <= 0 || latest.kwh === undefined) return null;
    return (latest.kwh / elapsedHours) * 24;
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
    const chartData = history.map(d => ({ ...d, timestamp: toMs(d.timestamp) }));
    const domain = getSixHourDomain(chartData);
    const ticks = getHourlyTicksInRange(domain);
    const visibleData = chartData.filter(d => d.timestamp >= domain[0]);
    const liveX = chartData.length > 0 ? chartData[chartData.length - 1].timestamp : null;

    return (
        <div className="glass-panel w-full h-80 flex flex-col bg-[#0B0D14] border-t-2 border-t-yellow-500/20 shadow-inner p-5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
                    <Activity size={16} className="text-warning" /> Live Power Trend
                    <span className="text-[9px] text-slate-500 normal-case tracking-normal">(past 6 hrs)</span>
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
                    <AreaChart data={visibleData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradient-trend-big" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
                                <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            scale="time"
                            domain={domain}
                            ticks={ticks}
                            tickFormatter={formatTime}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            domain={[0, MAX_WATTS]}
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
                        />
                        {liveX !== null && (
                            <>
                                <ReferenceLine x={liveX} stroke="#facc15" strokeDasharray="4 4" strokeWidth={1.5} />
                                <ReferenceDot
                                    x={liveX}
                                    y={current}
                                    r={6}
                                    fill="#facc15"
                                    stroke="#0B0D14"
                                    strokeWidth={2}
                                    isFront
                                    label={{ value: 'LIVE', position: 'top', fill: '#facc15', fontSize: 11, fontWeight: 700 }}
                                />
                            </>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function BigKwhTrend({ history = [] }) {
    const current = history.length > 0 ? history[history.length - 1].kwh : null;
    const chartData = history.map(d => ({ ...d, timestamp: toMs(d.timestamp) }));
    const domain = getDayDomain(chartData);
    const dayTicks = getDayTicks(domain);
    const liveX = chartData.length > 0 ? chartData[chartData.length - 1].timestamp : null;
    const estimatedTotal = estimateDayTotalKwh(chartData, domain);

    return (
        <div className="glass-panel w-full h-80 flex flex-col bg-[#0B0D14] border-t-2 border-t-emerald-500/20 shadow-inner p-5 relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" /> kWh Usage Over Time
                    <span className="text-[9px] text-slate-500 normal-case tracking-normal">(whole day)</span>
                </h2>
                <div className="flex items-center gap-2">
                    {estimatedTotal !== null && (
                        <div className="flex items-center gap-2 bg-emerald-500/5 border border-dashed border-emerald-500/30 px-2 py-1 rounded-full">
                            <span className="font-mono text-[11px] text-emerald-300/80">Est. day: {estimatedTotal.toFixed(2)} kWh</span>
                        </div>
                    )}
                    {current !== null && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="font-mono text-xs font-semibold text-emerald-400/90">{current.toFixed(3)} kWh</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradient-kwh-big" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(52, 211, 153, 0.4)" />
                                <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            scale="time"
                            domain={domain}
                            ticks={dayTicks}
                            tickFormatter={formatHourOnly}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
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
                        />
                        {liveX !== null && (
                            <>
                                <ReferenceLine x={liveX} stroke="rgb(52,211,153)" strokeDasharray="4 4" strokeWidth={1.5} />
                                <ReferenceDot
                                    x={liveX}
                                    y={current}
                                    r={6}
                                    fill="rgb(52,211,153)"
                                    stroke="#0B0D14"
                                    strokeWidth={2}
                                    isFront
                                    label={{ value: 'LIVE', position: 'top', fill: 'rgb(52,211,153)', fontSize: 11, fontWeight: 700 }}
                                />
                            </>
                        )}
                        {estimatedTotal !== null && (
                            <ReferenceLine
                                y={estimatedTotal}
                                stroke="rgba(52,211,153,0.5)"
                                strokeDasharray="6 4"
                                strokeWidth={1.5}
                                label={{ value: `Est. day total: ${estimatedTotal.toFixed(2)} kWh`, position: 'insideTopRight', fill: 'rgba(52,211,153,0.8)', fontSize: 10 }}
                            />
                        )}
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
            const simTime = extractSimTime(data);
            const nowMs = toMs(simTime);
            if (data?.total_watts !== undefined) {
                setPowerHistory(
                    DEMO_MODE
                        ? generateDemoWattsHistory(nowMs, data.total_watts)
                        : [{ timestamp: simTime, watts: data.total_watts }]
                );
            }
            if (data?.estimated_kwh !== undefined) {
                setKwhHistory(
                    DEMO_MODE
                        ? generateDemoKwhHistory(nowMs, data.estimated_kwh)
                        : [{ timestamp: simTime, kwh: data.estimated_kwh }]
                );
            }
        });
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'state_update') {
            fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
                setSummary(data);
                const simTime = extractSimTime(latest) ?? extractSimTime(data);
                if (data?.total_watts !== undefined) {
                    setPowerHistory(prev => [...prev, {
                        timestamp: simTime,
                        watts: data.total_watts
                    }].slice(-500));
                }
                if (data?.estimated_kwh !== undefined) {
                    setKwhHistory(prev => [...prev, {
                        timestamp: simTime,
                        kwh: data.estimated_kwh
                    }].slice(-500));
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