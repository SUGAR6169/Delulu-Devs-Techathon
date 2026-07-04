import { useEffect, useState } from 'react';
import { Fan, Lightbulb } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        fetch(`${API_BASE}/devices`).then(res => res.json()).then(setDevices);
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'state_update') {
            const updated = latest.data;
            setDevices(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
        }
    }, [wsMessages]);

    const toggleDevice = async (id) => {
        await fetch(`${API_BASE}/devices/${id}/toggle`, {
            method: 'POST',
            headers: { 'x-api-key': 'hackathon_demo_key' }
        });
    };

    const rooms = [...new Set(devices.map(d => d.room))];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Devices</h2>
            {rooms.map(room => (
                <div key={room} className="glass-panel p-6">
                    <h3 className="text-sm uppercase tracking-widest text-indigo-300/70 mb-4">{room}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {devices.filter(d => d.room === room).map(d => (
                            <button
                                key={d.id}
                                onClick={() => toggleDevice(d.id)}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${d.status ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {d.type === 'fan' ? <Fan size={18} className={d.status ? 'text-primary' : 'text-white/30'} /> : <Lightbulb size={18} className={d.status ? 'text-warning' : 'text-white/30'} />}
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-slate-200">{d.name}</p>
                                        <p className="text-xs text-slate-500">{d.power_draw_watts.toFixed(1)} W</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${d.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                                    {d.status ? 'ON' : 'OFF'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}