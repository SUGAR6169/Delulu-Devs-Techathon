import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Map, Cpu, Bell, BarChart3, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/live-monitor', label: 'Live Monitor', icon: Activity },
    { to: '/floorplan', label: 'Floorplan', icon: Map },
    { to: '/devices', label: 'Devices', icon: Cpu },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
    return (
        <aside className="w-56 shrink-0 bg-[#0d0e14] border-r border-white/5 flex flex-col h-screen sticky top-0">
            <div className="flex items-center gap-2 px-5 py-6">
                <img src="/logo.png" className="w-9 h-9 object-contain" alt="PowerView" />
                <div>
                    <h1 className="text-lg font-black text-white leading-none">PowerView</h1>
                    <p className="text-[9px] uppercase tracking-widest text-indigo-300/70 mt-1">
                        Office Energy Management
                    </p>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {links.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-indigo-500/15 text-indigo-300'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="m-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <ShieldCheck size={14} /> System Status
                    <span className="ml-auto text-emerald-400">Operational</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">All systems running normally</p>
            </div>
        </aside>
    );
}