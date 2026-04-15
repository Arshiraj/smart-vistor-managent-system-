import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  Bell, 
  MapPin, 
  FileText, 
  Save, 
  ChevronLeft, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';

const SystemConfig = () => {
    const { config, setConfig } = useSecurity();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('biometric');
    const [savedStatus, setSavedStatus] = useState(null); // 'saving', 'saved', null

    const handleSave = () => {
        setSavedStatus('saving');
        setTimeout(() => {
            setSavedStatus('saved');
            setTimeout(() => setSavedStatus(null), 2000);
        }, 800);
    };

    const sidebarItems = [
        { id: 'biometric', label: 'Biometric', icon: Fingerprint },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        { id: 'zones', label: 'Zones', icon: MapPin },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    const renderHeader = (title, desc) => (
        <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight">{title}</h2>
            <p className="text-white/40 text-sm mt-1">{desc}</p>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'biometric':
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                        {renderHeader('Biometric Engine', 'Fine-tune identification sensitivity and physical presence verification.')}
                        
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/60">Face Match Sensitivity</label>
                                    <span className="text-brand-primary font-mono font-bold text-lg">{config.biometric.sensitivity}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="100" 
                                    value={config.biometric.sensitivity}
                                    onChange={(e) => setConfig({ ...config, biometric: { ...config.biometric, sensitivity: e.target.value }})}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            <div className="glass-card p-6 flex items-center justify-between border-white/5 bg-white/2">
                                <div>
                                    <h4 className="text-sm font-bold">Liveness Detection</h4>
                                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Required for all high-security zones</p>
                                </div>
                                <button 
                                    onClick={() => setConfig({ ...config, biometric: { ...config.biometric, liveness: !config.biometric.liveness }})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${config.biometric.liveness ? 'bg-brand-primary' : 'bg-white/10'}`}
                                >
                                    <motion.div 
                                        animate={{ x: config.biometric.liveness ? 26 : 4 }} 
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                                    />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'alerts':
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                        {renderHeader('Alert Protocols', 'Configure escalation timing and behavioral anomaly thresholds.')}
                        
                        <div className="grid gap-6">
                            <div className="glass-card p-6 flex items-center justify-between border-white/5 bg-white/2">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest">Escalation Timer</h4>
                                    <p className="text-[10px] text-white/30 mt-1">Global audit log delay before manager page</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={config.alerts.timer}
                                        onChange={(e) => setConfig({ ...config, alerts: { ...config.alerts, timer: e.target.value }})}
                                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-right font-mono focus:border-brand-primary/50 outline-none"
                                    />
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">SEC</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-white/60 px-1">Anomaly Sensitivity</label>
                                <select 
                                    value={config.alerts.sensitivity}
                                    onChange={(e) => setConfig({ ...config, alerts: { ...config.alerts, sensitivity: e.target.value }})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:border-brand-primary/50 outline-none appearance-none"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'zones':
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                        {renderHeader('Zone Access Control', 'Manage logical security levels and maximum capacity per node.')}
                        
                        <div className="glass-card border-white/5 bg-white/2 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/2">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Zone Name</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Access Level</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Max People</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {config.zones.map((zone) => (
                                        <tr key={zone.id}>
                                            <td className="p-6 font-bold">{zone.name}</td>
                                            <td className="p-6">
                                                <select 
                                                    value={zone.level}
                                                    onChange={(e) => {
                                                        const newZones = config.zones.map(z => z.id === zone.id ? { ...z, level: e.target.value } : z);
                                                        setConfig({ ...config, zones: newZones });
                                                    }}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-brand-primary/50 outline-none"
                                                >
                                                    <option>Level 1</option>
                                                    <option>Level 2</option>
                                                    <option>Level 3</option>
                                                    <option>Level 4</option>
                                                </select>
                                            </td>
                                            <td className="p-6 text-right">
                                                <input 
                                                    type="number" 
                                                    value={zone.max}
                                                    onChange={(e) => {
                                                        const newZones = config.zones.map(z => z.id === zone.id ? { ...z, max: e.target.value } : z);
                                                        setConfig({ ...config, zones: newZones });
                                                    }}
                                                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-right focus:border-brand-primary/50 outline-none font-mono"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'reports':
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                        {renderHeader('Reports & Retention', 'Set automation preferences for security audits and log cycles.')}
                        
                        <div className="space-y-6">
                            <div className="glass-card p-6 flex items-center justify-between border-white/5 bg-white/2">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest">Auto PDF Generation</h4>
                                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Create report bundle upon alert resolution</p>
                                </div>
                                <button 
                                    onClick={() => setConfig({ ...config, reports: { ...config.reports, autoPdf: !config.reports.autoPdf }})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${config.reports.autoPdf ? 'bg-brand-primary' : 'bg-white/10'}`}
                                >
                                    <motion.div 
                                        animate={{ x: config.reports.autoPdf ? 26 : 4 }} 
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                                    />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/60">Log Retention (Days)</label>
                                    <span className="text-brand-primary font-mono font-bold text-lg">{config.reports.retention}D</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="7" max="365" 
                                        value={config.reports.retention}
                                        onChange={(e) => setConfig({ ...config, reports: { ...config.reports, retention: e.target.value }})}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-bg-dark text-white overflow-hidden cyber-grid">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-3xl relative z-20">
                <div className="p-8 border-b border-white/5 mb-6">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-4 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to HQ
                    </button>
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-brand-primary" />
                        SYSTEM CONFIG
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group relative ${
                                    isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {isActive && (
                                    <motion.div layoutId="pill" className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full" />
                                )}
                                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Secure Control Node</div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-primary/40 mt-1">V2.4-BUILD-88</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 lg:p-20 relative">
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Save Area */}
                    <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-white/20 italic uppercase tracking-widest">
                            * Changes apply globally to all designated facility nodes.
                        </p>
                        <button 
                            onClick={handleSave}
                            disabled={savedStatus === 'saving'}
                            className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all relative overflow-hidden flex items-center gap-3
                                ${savedStatus === 'saved' ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-brand-primary text-bg-dark hover:opacity-90 active:scale-95 shadow-[0_0_20px_rgba(0,242,254,0.2)]'}
                            `}
                        >
                            {savedStatus === 'saving' ? (
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : savedStatus === 'saved' ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                            
                            {/* Flash Animation */}
                            <AnimatePresence>
                                {savedStatus === 'saved' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-white/20"
                                    />
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="fixed bottom-0 left-64 w-[300px] h-[300px] bg-brand-secondary/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
            </main>
        </div>
    );
};

export default SystemConfig;
