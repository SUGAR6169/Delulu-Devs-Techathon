import { Fan, Lightbulb } from 'lucide-react';

function DeviceIcon({ device }) {
  if (!device) return <div className="w-9 h-9"></div>;
  const isOn = device.status;
  return (
    <div className={`p-2 rounded-full flex items-center justify-center transition-all duration-500 z-20 ${isOn ? (device.type === 'light' ? 'bg-warning/20 text-warning animate-pulse-glow scale-110' : 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-110') : 'bg-white/5 text-white/20'}`} title={device.name}>
      {device.type === 'fan' ? <Fan size={20} className={isOn ? 'animate-spin-slow' : ''} /> : <Lightbulb size={20} />}
    </div>
  );
}

export default function RoomLayout({ devices, alerts = [] }) {
  const getDevice = (id) => devices.find(d => d.id === id);

  const hasAlert = (roomName) => {
    return alerts.some(alert => alert.message.includes(roomName));
  };

  const getBorder = (roomName) => {
    if (!roomName) return "border-slate-700/50";
    return hasAlert(roomName) 
      ? "border-danger/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]" 
      : "border-slate-700/50 transition-colors duration-500";
  };

  return (
    <div className="glass-panel overflow-x-auto">
      <h2 className="text-[10px] uppercase tracking-widest text-indigo-300/70 mb-6 text-center">Live Office Floorplan</h2>
      
      <div className="min-w-[800px] w-full max-w-5xl mx-auto flex flex-col gap-0 border-8 border-[#1a1c26] rounded-xl p-3 bg-[#0d0f17]">
        
        {/* Top Row: 3 Rooms */}
        <div className="grid grid-cols-3 gap-3 h-80">
          
          {/* Drawing Room */}
          <div className={`border-4 rounded-lg relative p-6 flex flex-col justify-between overflow-hidden ${getBorder('Drawing Room')}`}>
            <h3 className="absolute top-3 left-3 bg-indigo-500/10 text-indigo-300 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-indigo-500/20 backdrop-blur-sm z-0">DRAWING ROOM</h3>
            
            {/* Top row of devices */}
            <div className="flex justify-between items-center z-10 px-4 mt-6">
               <DeviceIcon device={getDevice('drawing_light_1')} />
               <DeviceIcon device={getDevice('drawing_fan_1')} />
               <DeviceIcon device={getDevice('drawing_light_2')} />
            </div>
            
            {/* Furniture: Sofa on left, table center */}
            <div className="flex justify-start items-center flex-1 w-full gap-6 z-10 pl-2">
               <div className="w-10 h-32 bg-white/10 rounded-sm border border-white/5 flex flex-col justify-between p-1">
                 <div className="w-full h-1/3 border-b border-white/5"></div>
                 <div className="w-full h-1/3 border-t border-white/5"></div>
               </div>
               <div className="w-20 h-14 bg-white/10 rounded-sm border border-white/5 ml-4"></div>
            </div>

            {/* Bottom row of devices */}
            <div className="flex flex-col justify-center items-center z-10 relative pb-2">
               <div className="-mt-6 mb-1"><DeviceIcon device={getDevice('drawing_fan_2')} /></div>
               <div><DeviceIcon device={getDevice('drawing_light_3')} /></div>
            </div>
          </div>

          {/* Work Room 1 */}
          <div className={`border-4 rounded-lg relative p-6 flex flex-col justify-between overflow-hidden ${getBorder('Work Room 1')}`}>
            <h3 className="absolute top-3 left-3 bg-indigo-500/10 text-indigo-300 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-indigo-500/20 backdrop-blur-sm z-0">WORK ROOM 1</h3>
            
            {/* Top row of devices */}
            <div className="flex justify-between items-center z-10 px-6 mt-6">
               <DeviceIcon device={getDevice('work1_light_1')} />
               <DeviceIcon device={getDevice('work1_fan_1')} />
               <DeviceIcon device={getDevice('work1_light_2')} />
            </div>

            {/* Desks */}
            <div className="flex-1 flex flex-col justify-center gap-6 z-10 mt-2 px-4">
               <div className="flex justify-between">
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -left-4 shadow-xl"></div>
                 </div>
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -right-4 shadow-xl"></div>
                 </div>
               </div>
               <div className="flex justify-between">
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -left-4 shadow-xl"></div>
                 </div>
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -right-4 shadow-xl"></div>
                 </div>
               </div>
            </div>

            {/* Bottom row of devices */}
            <div className="flex flex-col justify-center items-center z-10 relative pb-2">
               <div className="-mt-6 mb-1"><DeviceIcon device={getDevice('work1_fan_2')} /></div>
               <div><DeviceIcon device={getDevice('work1_light_3')} /></div>
            </div>
          </div>

          {/* Work Room 2 */}
          <div className={`border-4 rounded-lg relative p-6 flex flex-col justify-between overflow-hidden ${getBorder('Work Room 2')}`}>
            <h3 className="absolute top-3 left-3 bg-indigo-500/10 text-indigo-300 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-indigo-500/20 backdrop-blur-sm z-0">WORK ROOM 2</h3>
            
            {/* Top row of devices */}
            <div className="flex justify-between items-center z-10 px-6 mt-6">
               <DeviceIcon device={getDevice('work2_light_1')} />
               <DeviceIcon device={getDevice('work2_fan_1')} />
               <DeviceIcon device={getDevice('work2_light_2')} />
            </div>

            {/* Desks */}
            <div className="flex-1 flex flex-col justify-center gap-6 z-10 mt-2 px-4">
               <div className="flex justify-between">
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -left-4 shadow-xl"></div>
                 </div>
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -right-4 shadow-xl"></div>
                 </div>
               </div>
               <div className="flex justify-between">
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -left-4 shadow-xl"></div>
                 </div>
                 <div className="w-16 h-10 bg-white/10 rounded-sm border border-white/5 flex items-center justify-center shadow-md relative">
                   <div className="w-6 h-3 bg-white/5 rounded-sm absolute -right-4 shadow-xl"></div>
                 </div>
               </div>
            </div>

            {/* Bottom row of devices */}
            <div className="flex flex-col justify-center items-center z-10 relative pb-2">
               <div className="-mt-6 mb-1"><DeviceIcon device={getDevice('work2_fan_2')} /></div>
               <div><DeviceIcon device={getDevice('work2_light_3')} /></div>
            </div>
          </div>

        </div>

        {/* Bottom Hallway */}
        <div className={`border-4 rounded-lg h-14 mt-4 relative flex items-end justify-center pb-1 bg-[#0d0f17] ${getBorder(null)}`}>
           <h3 className="absolute top-3 left-3 bg-indigo-500/10 text-indigo-300 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-indigo-500/20 backdrop-blur-sm z-0">HALLWAY</h3>
           <div className="absolute bottom-0 flex flex-col items-center">
             <div className="w-20 h-2 bg-indigo-600/50 mb-1 rounded-t-sm shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
             <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">ENTRY</span>
           </div>
        </div>

      </div>
    </div>
  );
}
