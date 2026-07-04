import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Clock } from 'lucide-react';

const WS_URL = 'ws://localhost:8000/ws/devices';

export default function HeaderClock() {
  const wsMessages = useWebSocket(WS_URL);
  const [simulatedTime, setSimulatedTime] = useState(null);

  useEffect(() => {
    if (wsMessages.length === 0) return;
    
    const latest = wsMessages[wsMessages.length - 1];
    if (latest.event === 'time_tick' && latest.data?.simulated_time) {
      setSimulatedTime(new Date(latest.data.simulated_time));
    }
  }, [wsMessages]);

  const formatTime = (date) => {
    if (!date) return 'Syncing clock...';
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
    }).format(date);
  };

  return (
    <div className="bg-[#181A25] border border-white/5 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
      <div className="text-indigo-400">
        <Clock size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-widest text-indigo-300/70 font-bold leading-none mb-1">
          Simulated Time (10x)
        </span>
        <span className="text-sm font-mono font-medium text-white leading-none">
          {formatTime(simulatedTime)}
        </span>
      </div>
    </div>
  );
}
