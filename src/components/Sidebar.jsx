import { LayoutDashboard, ScanFace, ShieldCheck, Settings, History, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we are on the config route to show a "Back to HQ" button
    const isConfigRoute = location.pathname === '/config';

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
        { id: 'scan', icon: ScanFace, label: 'Biometric Scan' },
        { id: 'logs', icon: History, label: 'Audit Logs' },
        { id: 'guard', icon: ShieldCheck, label: 'Guard Node', isExternal: true },
        { id: 'settings', icon: Settings, label: 'System Config', isRoute: true },
    ];

    return (
        <aside className="w-64 border-r border-white/10 bg-white/2 backdrop-blur-xl flex flex-col">
            <div className="p-8 pb-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Terminal Access</p>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.isExternal) {
                                    window.open('/guard', '_blank');
                                } else if (item.isRoute) {
                                    navigate('/config');
                                } else {
                                    if (isConfigRoute) navigate('/');
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : item.isExternal
                                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                                />
                            )}
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-6">
                <div className="glass-card p-4 bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs font-bold text-brand-primary">SECURE MODE</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                        AI-powered biometric scanning is currently active for all zones.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
