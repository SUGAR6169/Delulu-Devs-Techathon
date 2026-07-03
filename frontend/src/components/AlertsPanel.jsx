import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';

const RECENT_COUNT = 4;

function AlertRow({ alert }) {
  return (
    <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg flex gap-3 items-start">
      <AlertTriangle className="text-danger shrink-0 mt-0.5" size={18} />
      <div>
        <p className="text-sm font-medium text-slate-200">{alert.message}</p>
        <p className="text-xs text-danger/70 flex items-center gap-1 mt-1">
          <Clock size={12} />
          {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function AllAlertsModal({ alerts, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col bg-slate-900 border border-white/10 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-danger" /> All Alerts ({alerts.length})
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {alerts.map(alert => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AlertsPanel({ alerts }) {
  const [showAll, setShowAll] = useState(false);
  const recentAlerts = alerts.slice(0, RECENT_COUNT);

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-danger" /> Active Alerts
        </h2>
        {alerts.length > 0 && (
          <span className="text-xs font-medium text-danger/80 bg-danger/10 px-2 py-1 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
          <div className="bg-success/10 p-3 rounded-full mb-2">
            <AlertTriangle className="text-success" />
          </div>
          <p>No active anomalies detected.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 flex-1">
            {recentAlerts.map(alert => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>

          {alerts.length > RECENT_COUNT && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-medium text-slate-300 hover:text-white py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors shrink-0"
            >
              View all {alerts.length} alerts <ChevronRight size={16} />
            </button>
          )}
        </>
      )}

      {showAll && <AllAlertsModal alerts={alerts} onClose={() => setShowAll(false)} />}
    </div>
  );
}