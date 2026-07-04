import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import PowerMeter from '../components/PowerMeter';
import PowerTrend from '../components/PowerTrend';
import AlertsPanel from '../components/AlertsPanel';
import AlertsModal from '../components/AlertsModal';
import RoomLayout from '../components/RoomLayout';
import SimulationControl from '../components/SimulationControl';


const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

export default function Dashboard() {
    const [devices, setDevices] = useState([]);
    const [powerSummary, setPowerSummary] = useState(null);
    const [powerHistory, setPowerHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const wsMessages = useWebSocket(WS_URL);

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/devices`).then(res => res.json()),
            fetch(`${API_BASE}/power/summary`).then(res => res.json()),
            fetch(`${API_BASE}/alerts`).then(res => res.json())
        ]).then(([devs, power, alts]) => {
            setDevices(devs);
            setPowerSummary(power);
            if (power && power.total_watts !== undefined) {
                const now = Date.now();
                const initialHistory = Array.from({ length: 15 }, (_, i) => ({
                    timestamp: new Date(now - (14 - i) * 10000).toISOString(),
                    watts: power.total_watts
                }));
                setPowerHistory(initialHistory);
            }
            setAlerts(alts);
        }).catch(err => console.error("Failed to fetch initial state", err));
    }, []);



    const processedCount = useRef(0);

    useEffect(() => {
        const newMessages = wsMessages.slice(processedCount.current);
        processedCount.current = wsMessages.length;

        if (newMessages.length === 0) return;

        let shouldRefetchPower = false;

        newMessages.forEach((msg) => {
            if (msg.event === 'state_update') {
                const updatedDevice = msg.data;
                setDevices(prev => prev.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d));
                shouldRefetchPower = true;

            } else if (msg.event === 'alert_triggered') {
                setAlerts(prev => {
                    if (prev.find(a => a.id === msg.data.id)) return prev;
                    return [msg.data, ...prev].slice(0, 20);
                });
            } else if (msg.event === 'alert_updated') {
                setAlerts(prev => {
                    const exists = prev.find(a => a.id === msg.data.id);
                    if (exists) {
                        return prev.map(a => a.id === msg.data.id ? msg.data : a).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    } else {
                        return [msg.data, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
                    }
                });
            } else if (msg.event === 'alert_resolved') {
                setAlerts(prev => prev.filter(a => a.id !== msg.data.id));
            }
        });

        if (shouldRefetchPower) {
            fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
                setPowerSummary(data);
                if (data && data.total_watts !== undefined) {
                    setPowerHistory(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        watts: data.total_watts
                    }].slice(-50));
                }
            });
        }
    }, [wsMessages]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <PowerMeter summary={powerSummary} />
                <RoomLayout devices={devices} alerts={alerts} />
            </div>

            <div className="lg:col-span-1 flex flex-col h-full gap-4">
                <div className="flex-none">
                    <SimulationControl />
                </div>
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                    <AlertsPanel alerts={alerts} onOpenModal={() => setIsModalOpen(true)} />
                </div>
                <div className="flex-none">
                    <PowerTrend history={powerHistory} />
                </div>
            </div>

            {isModalOpen && <AlertsModal alerts={alerts} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}