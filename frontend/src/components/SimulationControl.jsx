import React, { useState } from 'react';
import { Play, Clock, Flame } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function SimulationControl() {
  const [activeMode, setActiveMode] = useState('normal_day');

  const triggerScenario = async (scenarioId) => {
    setActiveMode(scenarioId);
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
    <div className="glass-panel flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-base font-semibold text-white tracking-wide">Simulation Control</h2>
        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded-full border border-indigo-500/30">
          DEMO MODE
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => triggerScenario('normal_day')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${activeMode === 'normal_day' ? 'bg-cyan-500/10 border border-cyan-500/50' : 'bg-[#181A25] border border-white/5 hover:bg-white/5'}`}
        >
          <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-400 group-hover:scale-110 transition-transform">
            <Play size={14} />
          </div>
          <div>
            <div className="text-white text-xs font-medium leading-tight">Normal Operation</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Reset to 9:00 AM</div>
          </div>
        </button>

        <button
          onClick={() => triggerScenario('late_night_usage')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${activeMode === 'late_night_usage' ? 'bg-cyan-500/10 border border-cyan-500/50' : 'bg-[#181A25] border border-white/5 hover:bg-white/5'}`}
        >
          <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-500 group-hover:scale-110 transition-transform">
            <Clock size={14} />
          </div>
          <div>
            <div className="text-white text-xs font-medium leading-tight">After-Hours Leak</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Jump to 7:00 PM</div>
          </div>
        </button>

        <button
          onClick={() => triggerScenario('prolonged_operation')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${activeMode === 'prolonged_operation' ? 'bg-cyan-500/10 border border-cyan-500/50' : 'bg-[#181A25] border border-white/5 hover:bg-white/5'}`}
        >
          <div className="p-1.5 bg-red-500/10 rounded-md text-red-500 group-hover:scale-110 transition-transform">
            <Flame size={14} />
          </div>
          <div>
            <div className="text-white text-xs font-medium leading-tight">2-Hour Overtime</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Fast-forward clock</div>
          </div>
        </button>
      </div>
    </div>
  );
}
