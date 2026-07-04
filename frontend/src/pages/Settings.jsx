import { ShieldCheck, Server, Bot } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>

            <div className="glass-panel p-6 flex items-center gap-4">
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-emerald-400">System Status: Operational</p>
                    <p className="text-xs text-slate-500">All systems running normally</p>
                </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-4">
                <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
                    <Server size={20} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-200">Backend API</p>
                    <p className="text-xs text-slate-500 font-mono">http://localhost:8000/api</p>
                </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-4">
                <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
                    <Bot size={20} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-200">Discord Bot: EnergyBot</p>
                    <p className="text-xs text-slate-500">Commands: /status, /usage, /alerts</p>
                </div>
            </div>
        </div>
    );
}