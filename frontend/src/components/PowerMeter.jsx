import { Zap, Activity } from 'lucide-react';

const Sparkline = () => (
  <div className="w-full h-12 mt-4 relative">
    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
       <path d="M0 20 Q 10 15, 20 25 T 40 10 T 60 20 T 80 5 T 100 15" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" className="opacity-70" />
       <path d="M0 20 Q 10 15, 20 25 T 40 10 T 60 20 T 80 5 T 100 15 L 100 30 L 0 30 Z" fill="url(#gradient-warning)" className="opacity-20" />
       <defs>
         <linearGradient id="gradient-warning" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor="#eab308" stopOpacity="1" />
           <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
         </linearGradient>
       </defs>
    </svg>
  </div>
);

export default function PowerMeter({ summary }) {
  if (!summary) return (
      <div className="glass-panel animate-pulse h-48 flex items-center justify-center text-slate-500">
          Loading power data...
      </div>
  );

  return (
    <div className="glass-panel space-y-6 max-h-[450px] h-full flex flex-col">
      <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 flex items-center gap-2 shrink-0">
        <Activity size={14} className="text-indigo-400" /> Power Consumption
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <div className="bg-[#13151f] p-5 rounded-2xl border border-white/5 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-start justify-between z-10 relative">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-1">Total Live Wattage</p>
              <p className="font-mono text-white text-3xl font-semibold flex items-baseline gap-1">
                {summary.total_watts.toFixed(1)} <span className="text-sm font-medium text-slate-400">W</span>
              </p>
            </div>
            <Zap size={24} className="text-warning opacity-50" />
          </div>
          <Sparkline />
        </div>

        <div className="bg-[#13151f] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-1">Today's Estimated Usage</p>
            <p className="font-mono text-white text-3xl font-semibold flex items-baseline gap-1">
              {summary.estimated_kwh.toFixed(3)} <span className="text-sm font-medium text-slate-400">kWh</span>
            </p>
          </div>
          <Activity size={32} className="text-primary opacity-50" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex-1 flex flex-col justify-end">
        <h3 className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-4">Room Breakdown (Live)</h3>
        <div className="space-y-3">
          {Object.entries(summary.rooms_watts || {}).map(([room, watts]) => (
            <div key={room} className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">{room}</span>
              <span className="font-mono text-white text-lg font-semibold">{watts.toFixed(1)} W</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
