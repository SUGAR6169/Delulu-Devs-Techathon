import { Fan, Lightbulb } from 'lucide-react';

function VisualRoom({ name, devices }) {
  const fans = devices.filter(d => d.type === 'fan');
  const lights = devices.filter(d => d.type === 'light');

  return (
    <div className="bg-surface/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <h3 className="text-center font-bold text-slate-300 mb-6 relative z-10">{name}</h3>
      
      <div className="relative z-10 grid grid-cols-2 gap-6 place-items-center">
        {/* Lights */}
        {lights.map(l => (
          <div key={l.id} className={`p-4 rounded-full transition-all duration-500 ${l.status ? 'bg-warning/20 text-warning glow-yellow scale-110' : 'bg-slate-800 text-slate-600'}`} title={l.name}>
             <Lightbulb size={32} />
          </div>
        ))}
        {/* Fans */}
        {fans.map(f => (
          <div key={f.id} className={`p-4 rounded-full transition-all duration-500 ${f.status ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-110' : 'bg-slate-800 text-slate-600'}`} title={f.name}>
            <Fan size={32} className={f.status ? 'animate-spin-slow' : ''} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoomLayout({ devices }) {
  if (devices.length === 0) return null;

  const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];
  
  return (
    <div className="glass-panel">
      <h2 className="text-xl font-bold mb-4 text-center text-slate-400">Live Office Map</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
           <VisualRoom key={room} name={room} devices={devices.filter(d => d.room === room)} />
        ))}
      </div>
    </div>
  );
}
