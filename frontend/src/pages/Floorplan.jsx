import { useEffect, useState } from 'react';
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Floorplan</h2>
      <RoomLayout devices={devices} alerts={alerts} />
    </div>
  );
}