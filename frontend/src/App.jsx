import { useEffect, useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import PowerMeter from './components/PowerMeter';
import PowerTrend from './components/PowerTrend';
import AlertsPanel from './components/AlertsPanel';
import AlertsModal from './components/AlertsModal';
import RoomLayout from './components/RoomLayout';
import SimulationControl from './components/SimulationControl';
import HeaderClock from './components/HeaderClock';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/devices';

function App() {
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
        // Generate 15 points of flatline fake history leading up to now
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

  useEffect(() => {
    if (wsMessages.length === 0) return;
    
    const latest = wsMessages[wsMessages.length - 1];
    
    if (latest.event === 'state_update') {
      const updatedDevice = latest.data;
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d));
      
      fetch(`${API_BASE}/power/summary`).then(res => res.json()).then(data => {
        setPowerSummary(data);
        if (data && data.total_watts !== undefined) {
          setPowerHistory(prev => [...prev, {
            timestamp: new Date().toISOString(),
            watts: data.total_watts
          }].slice(-50));
        }
      });
      
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
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              {/* The logo is served from the public directory with no border or fallback text */}
              <img id="brand-logo" src="/logo.png" className="w-14 h-14 object-contain shrink-0" alt="PowerView" />
              
              <div className="flex flex-col justify-center text-left">
                <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                  PowerView
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-indigo-300/70 mt-1.5 font-medium leading-none">
                  OFFICE ENERGY MANAGEMENT
                </p>
              </div>
            </div>
          </div>
          <HeaderClock />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <PowerMeter summary={powerSummary} />
            <RoomLayout devices={devices} alerts={alerts} />
          </div>

          {/* Sidebar Column */}
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
        </div>

        {isModalOpen && <AlertsModal alerts={alerts} onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
}

export default App;
