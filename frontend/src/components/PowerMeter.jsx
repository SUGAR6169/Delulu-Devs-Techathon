import { Zap, Activity } from 'lucide-react';

export default function PowerMeter({ summary }) {
  if (!summary) return (
      <div className="glass-panel animate-pulse h-48 flex items-center justify-center text-slate-500">
          Loading power data...
      </div>
  );

  return (
    <div className="glass-panel space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Activity className="text-primary" /> Live Power Consumption
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Live Wattage</p>
            <p className="text-3xl font-black text-warning flex items-baseline gap-1">
              {summary.total_watts.toFixed(1)} <span className="text-sm font-normal">W</span>
            </p>
          </div>
          <Zap size={40} className="text-warning opacity-50" />
        </div>

        <div className="bg-surface/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Today's Estimated Usage</p>
            <p className="text-3xl font-black text-primary flex items-baseline gap-1">
              {summary.estimated_kwh.toFixed(3)} <span className="text-sm font-normal">kWh</span>
            </p>
          </div>
          <Activity size={40} className="text-primary opacity-50" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Room Breakdown (Live)</h3>
        <div className="space-y-2">
          {Object.entries(summary.rooms_watts || {}).map(([room, watts]) => (
            <div key={room} className="flex justify-between items-center text-sm">
              <span className="text-slate-400">{room}</span>
              <span className="font-mono">{watts.toFixed(1)} W</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
