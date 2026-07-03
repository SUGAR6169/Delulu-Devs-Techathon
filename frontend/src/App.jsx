import { useEffect, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import DeviceCard from './components/DeviceCard';
import PowerMeter from './components/PowerMeter';
import AlertsPanel from './components/AlertsPanel';
import RoomLayout from './components/RoomLayout';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

function App() {
  const [devices, setDevices] = useState([]);
  const [powerSummary, setPowerSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  const wsMessages = useWebSocket(WS_URL);

  useEffect(() => {
    // Initial fetch
    Promise.all([
      fetch(`${API_BASE}/devices`).then(res => res.json()),
      fetch(`${API_BASE}/power/summary`).then(res => res.json()),
      fetch(`${API_BASE}/alerts`).then(res => res.json())
    ]).then(([devs, power, alts]) => {
      setDevices(devs);
      setPowerSummary(power);
      setAlerts(alts);
    }).catch(err => console.error("Failed to fetch initial state", err));
  }, []);

  useEffect(() => {
    if (wsMessages.length === 0) return;
    
    const latest = wsMessages[wsMessages.length - 1];
    
    if (latest.event === 'state_update') {
      const updatedDevice = latest.data;
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d));
      
      // Update power summary
      fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(setPowerSummary);
      
    } else if (latest.event === 'alert_triggered') {
      setAlerts(prev => [latest.data, ...prev].slice(0, 20));
    }
  }, [wsMessages]);

  const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8 mt-4 text-center lg:text-left">
        <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent inline-block">
          Delulu Office Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Live monitoring of electrical devices and power consumption.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PowerMeter summary={powerSummary} />
        </div>
        <div>
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      <RoomLayout devices={devices} />

      <div className="glass-panel">
        <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">Device Status Panel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{room}</h3>
              {devices.filter(d => d.room === room).map(device => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
