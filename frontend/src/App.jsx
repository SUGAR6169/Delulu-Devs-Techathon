import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HeaderClock from './components/HeaderClock';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import Floorplan from './pages/Floorplan';
import Devices from './pages/Devices';
import AlertsPage from './pages/AlertsPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="min-h-screen bg-background text-slate-200 flex">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6">
        <header className="flex justify-end items-center gap-4">
          <HeaderClock />
          <div className="flex items-center gap-3 bg-[#181A25] border border-white/5 p-2 pr-4 rounded-xl">
            <div className="bg-indigo-500/10 text-indigo-400 rounded-lg p-2 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09,2.7-27.17-2.61-50.56-19-72.06ZM42.49,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.49,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.1,53,91.08,65.69,84.73,65.69Z" />
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
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-monitor" element={<LiveMonitor />} />
          <Route path="/floorplan" element={<Floorplan />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;