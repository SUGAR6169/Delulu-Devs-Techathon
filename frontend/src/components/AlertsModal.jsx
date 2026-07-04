import { AlertTriangle, Clock, X, Flame } from 'lucide-react';
import { enrichAndSortAlerts } from './AlertsPanel';

export default function AlertsModal({ alerts, onClose }) {
  const sortedAlerts = enrichAndSortAlerts(alerts);

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
          {sortedAlerts.map(alert => {
            const isOveruse = alert.alertType === 'continuous_overuse';
            const badgeText = isOveruse ? 'OVERUSE' : 'AFTER HOURS';
            const IconComp = isOveruse ? Flame : Clock;
            const containerClass = isOveruse 
              ? "bg-danger/5 border border-danger/20 px-4 pt-4 pb-3 rounded-2xl flex gap-3 items-start animate-slide-down" 
              : "bg-warning/5 border border-warning/20 px-4 pt-4 pb-3 rounded-2xl flex gap-3 items-start animate-slide-down";
            const iconColor = isOveruse ? "text-danger" : "text-warning";
            const badgeColor = isOveruse ? "text-danger/70" : "text-warning/70";

            return (
            <div key={alert.id} className={containerClass}>
              <IconComp className={`${iconColor} shrink-0 mt-0.5`} size={16} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200 leading-snug">{alert.message}</p>
                <div className={`text-[10px] uppercase tracking-widest ${badgeColor} flex items-center gap-2 mt-2 font-mono`}>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="opacity-50">•</span>
                  <span className="font-bold">{badgeText}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
