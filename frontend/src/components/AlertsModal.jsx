import { AlertTriangle, Clock, X } from 'lucide-react';

export default function AlertsModal({ alerts, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 flex items-center gap-2 mb-6 shrink-0">
          <AlertTriangle size={14} className="text-danger" /> Complete Alert History
        </h2>
        
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-danger/5 border border-danger/20 p-4 rounded-2xl flex gap-3 items-start animate-slide-down">
              <AlertTriangle className="text-danger shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-slate-200 leading-snug">{alert.message}</p>
                <p className="text-[10px] uppercase tracking-widest text-danger/70 flex items-center gap-1 mt-2 font-mono">
                  <Clock size={10} />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
