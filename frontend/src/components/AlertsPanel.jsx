import { AlertTriangle, Clock, Maximize2, Flame } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Helper to enrich and sort alerts
export const enrichAndSortAlerts = (alerts) => {
  const enriched = alerts.map(alert => {
    // Derive type based on message/type without touching backend
    const isOveruse = alert.type === 'excessive_usage' || 
                      alert.message.toLowerCase().includes('too long') || 
                      alert.message.toLowerCase().includes('continuously') ||
                      alert.message.toLowerCase().includes('2+ hours');
    
    return {
      ...alert,
      alertType: isOveruse ? 'continuous_overuse' : 'after_hours'
    };
  });

  return enriched.sort((a, b) => {
    // Sort by severity first
    if (a.alertType === 'continuous_overuse' && b.alertType !== 'continuous_overuse') return -1;
    if (b.alertType === 'continuous_overuse' && a.alertType !== 'continuous_overuse') return 1;
    // Then by timestamp (descending)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
};

export default function AlertsPanel({ alerts, onOpenModal }) {
  // Enrich, sort, and only show top 3 in the preview panel
  const sortedAlerts = enrichAndSortAlerts(alerts);
  const previewAlerts = sortedAlerts.slice(0, 3);
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.96, 
      y: shouldReduceMotion ? 0 : -8,
      height: 0,
      marginBottom: 0
    },
    visible: (i) => ({
      opacity: 1, 
      scale: 1, 
      y: 0,
      height: 'auto',
      marginBottom: 16, // Equivalent to space-y-4 gap
      transition: {
        opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        scale: { duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        y: { duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        height: { duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        marginBottom: { duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }
      }
    }),
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.97,
      height: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderWidth: 0,
      transition: {
        opacity: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        scale: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        height: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.2 },
        marginBottom: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.2 },
        paddingTop: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.2 },
        paddingBottom: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.2 },
        borderWidth: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.2 }
      }
    }
  };

  const iconVariants = {
    hidden: { scale: shouldReduceMotion ? 1 : 0.7 },
    visible: (i) => ({
      scale: 1,
      transition: {
        duration: 0.32, 
        ease: [0.16, 1, 0.3, 1], 
        delay: (i * 0.06) + 0.08 // 80ms delay relative to container
      }
    })
  };

  return (
    <div className="glass-panel h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
          <AlertTriangle size={14} className="text-danger" /> Active Alerts
        </h2>
        <button onClick={onOpenModal} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1" title="View Full History">
          <Maximize2 size={14} />
        </button>
      </div>
      
      {previewAlerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
          <div className="bg-emerald-500/10 p-4 rounded-full mb-3">
            <AlertTriangle className="text-emerald-500" size={24} />
          </div>
          <p className="text-sm font-medium">No active anomalies</p>
        </div>
      ) : (
        <div className="overflow-hidden flex-1 relative">
          <AnimatePresence initial={false}>
            {previewAlerts.map((alert, i) => {
              const isOveruse = alert.alertType === 'continuous_overuse';
              const badgeText = isOveruse ? 'OVERUSE' : 'AFTER HOURS';
              const IconComp = isOveruse ? Flame : Clock;
              const containerClass = isOveruse 
                ? "bg-danger/5 border border-danger/20 px-4 pt-4 pb-3 rounded-2xl flex gap-3 items-start overflow-hidden" 
                : "bg-warning/5 border border-warning/20 px-4 pt-4 pb-3 rounded-2xl flex gap-3 items-start overflow-hidden";
              const iconColor = isOveruse ? "text-danger" : "text-warning";
              const badgeColor = isOveruse ? "text-danger/70" : "text-warning/70";

              return (
              <motion.div 
                key={alert.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
                className={containerClass}
              >
                <motion.div variants={iconVariants} custom={i}>
                  <IconComp className={`${iconColor} shrink-0 mt-0.5`} size={16} />
                </motion.div>
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
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}