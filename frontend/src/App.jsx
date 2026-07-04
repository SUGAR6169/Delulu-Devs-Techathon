import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
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
      setAlerts(prev => {
        const exists = prev.find(a => a.id === latest.data.id);
        if (exists) {
          return prev.map(a => a.id === latest.data.id ? latest.data : a).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
          return [latest.data, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
        }
      });
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
          <div className="flex items-center gap-4">
            <HeaderClock />
            <div className="flex items-center gap-3 bg-[#181A25] border border-white/5 p-2 pr-4 rounded-xl">
              <div className="bg-indigo-500/10 text-indigo-400 rounded-lg p-2 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09,2.7-27.17-2.61-50.56-19-72.06ZM42.49,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.49,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.1,53,91.08,65.69,84.73,65.69Z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] leading-none mb-1 text-slate-200">
                  Use <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">EnergyBot</span> on discord
                </span>
                <span className="text-xs text-slate-300 leading-none">
                  Use <span className="bg-white/5 px-1 rounded text-indigo-300 font-mono">/status</span>, <span className="bg-white/5 px-1 rounded text-indigo-300 font-mono">/usage</span>, <span className="bg-white/5 px-1 rounded text-indigo-300 font-mono">/alerts</span>
                </span>
              </div>
            </div>
          </div>
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
