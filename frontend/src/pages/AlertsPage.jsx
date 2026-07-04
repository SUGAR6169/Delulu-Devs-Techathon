
import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        fetch(`${API_BASE}/alerts`).then(res => res.json()).then(setAlerts);
    }, []);

    useEffect(() => {
        if (wsMessages.length === 0) return;
        const latest = wsMessages[wsMessages.length - 1];
        if (latest.event === 'alert_triggered') {
            setAlerts(prev => prev.find(a => a.id === latest.data.id) ? prev : [latest.data, ...prev]);
        } else if (latest.event === 'alert_resolved') {
            setAlerts(prev => prev.filter(a => a.id !== latest.data.id));
        }
    }, [wsMessages]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-danger" /> Alerts ({alerts.length})
            </h2>
            {alerts.length === 0 ? (
                <div className="glass-panel p-10 text-center text-slate-500">No active anomalies detected.</div>
            ) : (
                <div className="space-y-3">
                    {alerts.map(alert => (
                        <div key={alert.id} className="bg-danger/10 border border-danger/20 p-4 rounded-lg flex gap-3 items-start">
                            <AlertTriangle className="text-danger shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-medium text-slate-200">{alert.message}</p>
                                <p className="text-xs text-danger/70 flex items-center gap-1 mt-1">
                                    <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}