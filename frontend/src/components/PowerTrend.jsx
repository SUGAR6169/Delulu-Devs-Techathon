import React from 'react';
import { Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function PowerTrend({ history = [] }) {
  // Format data for Recharts (handle both objects and raw numbers)
  const data = history.map((item, index) => {
    if (typeof item === 'object' && item !== null) return item;
    return { time: index, watts: item };
  });

  const currentWatts = data.length > 0 ? data[data.length - 1].watts : null;

  return (
    <div className="glass-panel w-full h-44 flex flex-col bg-[#0B0D14] border-t-2 border-t-yellow-500/20 shadow-inner p-4 relative overflow-hidden group shrink-0">
      <div className="flex items-center justify-between mb-2 relative z-10 shrink-0">
        <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 flex items-center gap-2">
          <Activity size={14} className="text-warning" /> Live Power Trend
        </h2>
        {currentWatts !== null && (
          <span className="font-mono text-sm font-semibold text-yellow-500/80">
            {currentWatts.toFixed(1)} W
          </span>
        )}
      </div>
      
      <div className="w-full flex-1 -ml-4 -mr-4 -mb-4 relative z-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
                <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="watts" 
              stroke="rgb(250, 204, 21)" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#gradient-trend)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
