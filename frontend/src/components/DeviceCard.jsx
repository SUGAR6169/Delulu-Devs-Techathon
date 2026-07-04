import { Fan, Lightbulb } from 'lucide-react';

export default function DeviceCard({ device }) {
  const { name, type, status } = device;
  const isOn = status;
  
  return (
    <div 
      className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all duration-300 ${
        isOn 
          ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
          : 'bg-white/5 border-white/5'
      }`}
      title={name}
    >
      <div className={`${isOn ? (type === 'light' ? 'text-warning animate-pulse-glow' : 'text-primary') : 'text-white/40'}`}>
        {type === 'fan' ? <Fan className={isOn ? 'animate-spin-slow' : ''} size={16} /> : <Lightbulb size={16} />}
      </div>
      <div className={`mt-1 text-[8px] font-bold ${isOn ? 'text-emerald-400' : 'text-white/40'}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
