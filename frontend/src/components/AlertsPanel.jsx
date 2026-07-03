import { AlertTriangle, Clock } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  return (
    <div className="glass-panel h-full flex flex-col">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4 shrink-0">
        <AlertTriangle className="text-danger" /> Active Alerts
      </h2>
      
      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
          <div className="bg-success/10 p-3 rounded-full mb-2">
            <AlertTriangle className="text-success" />
          </div>
          <p>No active anomalies detected.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-danger/10 border border-danger/20 p-3 rounded-lg flex gap-3 items-start">
              <AlertTriangle className="text-danger shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-slate-200">{alert.message}</p>
                <p className="text-xs text-danger/70 flex items-center gap-1 mt-1">
                  <Clock size={12} />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
