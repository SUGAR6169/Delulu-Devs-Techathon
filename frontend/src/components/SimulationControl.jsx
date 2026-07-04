import React from 'react';
import { Play, Moon, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function SimulationControl() {
  const triggerScenario = async (scenarioId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/scenarios/${scenarioId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        console.error('Failed to trigger scenario:', await response.text());
      }
    } catch (error) {
      console.error('Error triggering scenario:', error);
    }
  };

  return (
    <div className="glass-panel flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-semibold text-white tracking-wide">Simulation Control</h2>
        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded-full border border-indigo-500/30">
          DEMO MODE
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => triggerScenario('normal_day')}
          className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
        >
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
            <Play size={18} />
          </div>
          <div>
            <div className="text-white font-medium">Normal Operation</div>
            <div className="text-xs text-slate-400">Reset clock to 9:00 AM start</div>
          </div>
        </button>

        <button
          onClick={() => triggerScenario('late_night_usage')}
          className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
        >
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
            <Moon size={18} />
          </div>
          <div>
            <div className="text-white font-medium">After-Hours Leak Anomaly</div>
            <div className="text-xs text-slate-400">Instantly jump time to 7:00 PM</div>
          </div>
        </button>

        <button
          onClick={() => triggerScenario('prolonged_operation')}
          className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
        >
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-white font-medium">Force 2-Hour Overtime Spike</div>
            <div className="text-xs text-slate-400">Fast-forward clock by exactly 2 hours</div>
          </div>
        </button>
      </div>
    </div>
  );
}
