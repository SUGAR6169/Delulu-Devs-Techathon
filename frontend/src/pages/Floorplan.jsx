import { useEffect, useState } from 'react';
import { Fan, Lightbulb } from 'lucide-react';
import RoomLayout from '../components/RoomLayout';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function Floorplan() {
    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        fetch(`${API_BASE}/devices`).then(res => res.json()).then(setDevices);
        fetch(`${API_BASE}/alerts`).then(res => res.json()).then(setAlerts);
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'state_update') {
            const updated = latest.data;
            setDevices(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
        }
    }, [wsMessages]);

    const rooms = [...new Set(devices.map(d => d.room))];

    const getRoomStats = (room) => {
        const roomDevices = devices.filter(d => d.room === room);
        const lights = roomDevices.filter(d => d.type === 'light');
        const fans = roomDevices.filter(d => d.type === 'fan');
        return {
            lightsTotal: lights.length,
            lightsOn: lights.filter(d => d.status).length,
            fansTotal: fans.length,
            fansOn: fans.filter(d => d.status).length,
        };
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Floorplan</h2>

            <RoomLayout devices={devices} alerts={alerts} />

            <div className="glass-panel p-6">
                <h3 className="text-base uppercase tracking-widest text-indigo-300/70 mb-4">Room Report</h3>
                <div className="space-y-4">
                    {rooms.map(room => {
                        const stats = getRoomStats(room);
                        return (
                            <div key={room} className="border border-white/5 rounded-lg p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-slate-200">{room}</span>
                                    <span className="text-sm text-slate-500">
                                        {stats.lightsTotal} lights, {stats.fansTotal} fans
                                    </span>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb size={22} className={stats.lightsOn > 0 ? 'text-warning' : 'text-white/20'} />
                                        <span className="text-base text-slate-300">
                                            Lights: <span className="font-mono text-lg text-white">{stats.lightsOn} on</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Fan size={22} className={stats.fansOn > 0 ? 'text-primary' : 'text-white/20'} />
                                        <span className="text-base text-slate-300">
                                            Fans: <span className="font-mono text-lg text-white">{stats.fansOn} on</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}