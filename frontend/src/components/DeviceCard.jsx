import { Fan, Lightbulb } from 'lucide-react';

export default function DeviceCard({ device }) {
  const { name, type, status, power_draw_watts } = device;
  const isOn = status;

  return (
    <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${isOn ? 'bg-[#1e2333] border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-surface border-white/5'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-full ${isOn ? (type === 'light' ? 'bg-warning/20 text-warning animate-pulse-glow' : 'bg-primary/20 text-primary') : 'bg-white/5 text-white/40'}`}>
          {type === 'fan' ? <Fan className={isOn ? 'animate-spin-slow' : ''} size={20} /> : <Lightbulb size={20} />}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-slate-200">{name}</h3>
          <p className="font-mono text-white text-lg font-semibold mt-0.5">{isOn ? `${power_draw_watts.toFixed(1)}W` : '0.0W'}</p>
        </div>
      </div>
      <div className={`px-3 py-1 text-xs rounded-full ${isOn ? 'bg-emerald-500/20 text-emerald-400 font-bold tracking-wide' : 'bg-white/5 text-white/40 font-medium'}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
