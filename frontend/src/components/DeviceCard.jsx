import { Fan, Lightbulb } from 'lucide-react';

export default function DeviceCard({ device }) {
  const { name, type, status, power_draw_watts } = device;
  const isOn = status;

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOn ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'bg-surface/50 border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isOn ? (type === 'light' ? 'bg-warning/20 text-warning glow-yellow' : 'bg-primary/20 text-primary') : 'bg-slate-700 text-slate-400'}`}>
          {type === 'fan' ? <Fan className={isOn ? 'animate-spin-slow' : ''} size={24} /> : <Lightbulb size={24} />}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs text-slate-400">{isOn ? `${power_draw_watts.toFixed(1)}W` : 'Off'}</p>
        </div>
      </div>
      <div className={`px-2 py-1 text-xs rounded-full font-bold ${isOn ? 'bg-success/20 text-success' : 'bg-slate-700 text-slate-300'}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
