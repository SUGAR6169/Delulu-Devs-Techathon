import { useEffect, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import DeviceCard from './components/DeviceCard';
import PowerMeter from './components/PowerMeter';
import AlertsPanel from './components/AlertsPanel';
import AlertsModal from './components/AlertsModal';
import RoomLayout from './components/RoomLayout';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

function App() {
  const [devices, setDevices] = useState([]);
  const [powerSummary, setPowerSummary] = useState(null);
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
      setAlerts(alts);
    }).catch(err => console.error("Failed to fetch initial state", err));
  }, []);

  useEffect(() => {
    if (wsMessages.length === 0) return;
    
    const latest = wsMessages[wsMessages.length - 1];
    
    if (latest.event === 'state_update') {
      const updatedDevice = latest.data;
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d));
      
      fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(setPowerSummary);
      
    } else if (latest.event === 'alert_triggered') {
      setAlerts(prev => {
        // Prevent duplicate IDs just in case
        if (prev.find(a => a.id === latest.data.id)) return prev;
        return [latest.data, ...prev].slice(0, 20);
      });
    } else if (latest.event === 'alert_updated') {
      setAlerts(prev => prev.map(a => a.id === latest.data.id ? latest.data : a).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
  }, [wsMessages]);

  const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];

  return (
    <div className="min-h-screen bg-background text-slate-200">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <header className="mb-10 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Delulu Office Monitor
            </h1>
            <p className="text-[12px] uppercase tracking-widest text-indigo-300/70 mt-2 font-medium">Real-time telemetry & electrical analytics</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">System Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[450px]">
            <PowerMeter summary={powerSummary} />
          </div>
          <div className="h-[450px]">
            <AlertsPanel alerts={alerts} onOpenModal={() => setIsModalOpen(true)} />
          </div>
        </div>

        {isModalOpen && <AlertsModal alerts={alerts} onClose={() => setIsModalOpen(false)} />}

        <RoomLayout devices={devices} alerts={alerts} />

        <div className="glass-panel">
          <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-6 border-b border-white/5 pb-4">Device Status Subsystems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map(room => (
              <div key={room} className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-white/50 bg-[#13151f] border border-white/5 px-3 py-1.5 rounded-lg inline-block shadow-inner">{room}</h3>
                {devices.filter(d => d.room === room).map(device => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
