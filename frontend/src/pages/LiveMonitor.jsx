import { useEffect, useState } from 'react';
import PowerMeter from '../components/PowerMeter';
import { useWebSocket } from '../hooks/useWebSocket';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function LiveMonitor() {
    const [powerSummary, setPowerSummary] = useState(null);
    const [powerHistory, setPowerHistory] = useState([]);
    const [simulatedTime, setSimulatedTime] = useState(null);
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
        if (latest.event === 'time_tick' && latest.data?.simulated_time) {
            setSimulatedTime(new Date(latest.data.simulated_time));
        }
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

    let greeting = 'Hello Boss!';
    if (simulatedTime) {
        const hour = parseInt(new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: 'Asia/Dhaka'
        }).format(simulatedTime));

        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning Boss!';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon Boss!';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good Evening Boss!';
        } else {
            greeting = 'Good Night Boss!';
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Live Monitor</h2>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8">
                {greeting}
            </h1>
            <PowerMeter summary={powerSummary} layout="list" />

        </div>
    );
}