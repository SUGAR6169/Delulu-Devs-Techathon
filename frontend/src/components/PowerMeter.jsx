import { Zap, Activity } from 'lucide-react';

export default function PowerMeter({ summary, layout = 'cards' }) {
  if (!summary) return (
      <div className="glass-panel animate-pulse h-48 flex items-center justify-center text-slate-500">
          Loading power data...
      </div>
  );

  return (
    <div className="glass-panel space-y-6">
      <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
        <Activity size={14} className="text-indigo-400" /> Power Consumption
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#13151f] p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-300/70 mb-2">Total Live Wattage</p>
            <p className="font-mono text-white text-4xl font-semibold flex items-baseline gap-1">
              {summary.total_watts.toFixed(1)} <span className="text-base font-medium text-slate-400">W</span>
            </p>
          </div>
          <Zap size={36} className="text-warning opacity-50" />
        </div>

        <div className="bg-[#13151f] p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-300/70 mb-2">Today's Estimated Usage</p>
            <p className="font-mono text-white text-4xl font-semibold flex items-baseline gap-1">
              {summary.estimated_kwh.toFixed(3)} <span className="text-base font-medium text-slate-400">kWh</span>
            </p>
          </div>
          <Activity size={36} className="text-primary opacity-50" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <h3 className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-4">Room Breakdown (Live)</h3>
        {layout === 'list' ? (
            <div className="space-y-4">
              {Object.entries(summary.rooms_watts || {}).map(([room, watts]) => {
                const barColor = room === 'Drawing Room' ? 'bg-indigo-500' : room === 'Work Room 1' ? 'bg-yellow-500' : 'bg-teal-400';
                return (
                  <div key={room}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{room}</span>
                      <span className="font-mono text-white">{watts.toFixed(1)} W</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(100, (watts / (summary.total_watts || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(summary.rooms_watts || {}).map(([room, watts]) => {
                const roomPrefix = room.replace(' Room', '');
                return (
                  <div key={room} className="relative bg-white/5 pt-4 pb-5 rounded-xl border border-white/5 flex flex-col items-center text-center w-full overflow-hidden">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{roomPrefix}</span>
                    <span className="font-mono text-white text-xl font-bold">{watts.toFixed(1)} W</span>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${room === 'Drawing Room' ? 'bg-indigo-500' : room === 'Work Room 1' ? 'bg-yellow-500' : 'bg-teal-400'}`}
                        style={{ width: `${Math.min((watts / 165) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}
