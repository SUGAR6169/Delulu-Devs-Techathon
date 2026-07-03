import { AlertTriangle, Clock, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function AlertsPanel({ alerts, onOpenModal }) {
  // Only show top 3 in the preview panel
  const previewAlerts = alerts.slice(0, 3);
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
    <div className="glass-panel h-full flex flex-col relative max-h-[450px]">
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
            {previewAlerts.map((alert, i) => (
              <motion.div 
                key={alert.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
                className="bg-danger/5 border border-danger/20 p-4 rounded-2xl flex gap-3 items-start overflow-hidden"
              >
                <motion.div variants={iconVariants} custom={i}>
                  <AlertTriangle className="text-danger shrink-0 mt-0.5" size={16} />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-slate-200 leading-snug">{alert.message}</p>
                  <p className="text-[10px] uppercase tracking-widest text-danger/70 flex items-center gap-1 mt-2 font-mono">
                    <Clock size={10} />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {alerts.length > 3 && (
            <motion.div layout className="text-center pt-2">
               <button onClick={onOpenModal} className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                 + {alerts.length - 3} more alerts...
               </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}