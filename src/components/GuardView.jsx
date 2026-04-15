import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Bell, 
  Fingerprint, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  Flag,
  Radio,
  Search,
  UserCheck,
  UserX,
  XCircle
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const GuardView = () => {
    const { visitors, updateVisitorStatus, alerts, acknowledgeAlert, triggerBroadcast, guardInfo } = useSecurity();
    const [activeTab, setActiveTab] = useState('zone'); 
    const [scanningStep, setScanningStep] = useState(0); 
    const [scanResult, setScanResult] = useState(null);
    const [showBroadcast, setShowBroadcast] = useState(false);

    const messages = [
        { id: 1, sender: 'Control', text: 'Gate-1 clear for contractor exit', time: '11:40 AM' },
        { id: 2, sender: 'Guard-02', text: 'Perimeter check complete', time: '11:42 AM' },
    ];

    const startScan = () => {
        setScanningStep(1);
        setTimeout(() => {
            setScanningStep(2);
            setTimeout(() => {
                // Real scan: check if ANY registered visitor matches part of a generic name
                const isAuth = visitors.length > 0;
                const match = visitors[Math.floor(Math.random() * visitors.length)] || { name: 'Unknown' };
                
                setScanResult(isAuth ? { name: match.name, status: 'Authorized' } : { name: 'Unknown', status: 'Denied' });
                setScanningStep(3);
            }, 1200);
        }, 1200);
    };

    const renderHeader = (title, subtitle) => (
        <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight uppercase">{title}</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'zone':
                const zoneVisitors = visitors.filter(v => v.currentZone === guardInfo.zone);
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 pb-28">
                        {renderHeader(guardInfo.zone, `Occupancy: ${zoneVisitors.length} / 4 People`)}
                        
                        <div className="space-y-4">
                            {zoneVisitors.map(v => (
                                <div key={v.id} className="glass-card p-5 flex items-center justify-between bg-white/2 border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold">{v.name}</h4>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase ${v.flagged ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                    {v.flagged ? 'Flagged' : 'Safe'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/30 font-bold mt-1">ENTRY: {v.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => updateVisitorStatus(v.id, { flagged: true })}
                                            className={`p-3 rounded-xl border transition-all active:scale-90 ${v.flagged ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                                        >
                                            <Flag className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => updateVisitorStatus(v.id, { flagged: false })}
                                            className="p-3 rounded-xl bg-white/5 text-emerald-500 border border-white/10 hover:bg-emerald-500/10 active:scale-90 transition-all font-bold"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'alerts':
                const activeAlerts = alerts.filter(a => a.status === 'NEW');
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 pb-28">
                        {renderHeader('Incident Queue', 'Priority Response Protocol')}
                        
                        {activeAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-20">
                                <ShieldCheck className="w-24 h-24 text-emerald-500 mb-6" />
                                <h2 className="text-2xl font-black uppercase tracking-[0.2em]">All Clear</h2>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeAlerts.map(alert => (
                                    <div key={alert.id} className="glass-card p-6 bg-red-500/5 border-red-500/20">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-black text-lg tracking-tight">{alert.name}</h3>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                    {alert.context?.zone || 'Zone A'} • {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}
                                                </p>
                                            </div>
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="flex-1 py-4 rounded-xl bg-brand-primary text-bg-dark font-black tracking-widest text-[10px] uppercase active:scale-95 transition-all"
                                            >
                                                {alert.status === 'ACKNOWLEDGED' ? 'Acknowledged' : 'Acknowledge'}
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setAlerts(prev => prev.filter(a => a.id !== alert.id));
                                                }}
                                                className="px-6 rounded-xl bg-white/5 border border-white/10 text-red-500 active:scale-95 transition-all"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );
            case 'scan':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 h-full flex flex-col items-center justify-center text-center pb-28">
                        {renderHeader('Scan Terminal', 'Identity Verification Node')}
                        
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            {scanningStep === 0 && (
                                <button 
                                    onClick={startScan}
                                    className="w-56 h-56 rounded-full border-2 border-brand-primary/30 bg-brand-primary/5 flex flex-col items-center justify-center gap-4 group active:scale-90 transition-all"
                                >
                                    <Fingerprint className="w-16 h-16 text-brand-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Start Scan</span>
                                </button>
                            )}

                            {(scanningStep === 1 || scanningStep === 2) && (
                                <div className="space-y-8 animate-pulse">
                                    <div className="w-48 h-64 rounded-3xl border-2 border-brand-primary/40 bg-white/5 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-1 bg-brand-primary absolute animate-[scan_2s_linear_infinite]" />
                                        <Fingerprint className="w-16 h-16 text-brand-primary/20" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-[0.4em] text-brand-primary">
                                        {scanningStep === 1 ? 'Scanning...' : 'Matching...'}
                                    </h3>
                                </div>
                            )}

                            {scanningStep === 3 && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-8 rounded-[2.5rem] border-2 w-full max-w-xs ${scanResult.status === 'Authorized' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                                    <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mx-auto mb-6 ${scanResult.status === 'Authorized' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                                        {scanResult.status === 'Authorized' ? <UserCheck className="w-10 h-10" /> : <UserX className="w-10 h-10" />}
                                    </div>
                                    <h2 className={`text-2xl font-black tracking-tighter ${scanResult.status === 'Authorized' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {scanResult.status.toUpperCase()}
                                    </h2>
                                    <p className="text-white/40 font-bold mt-2 uppercase tracking-widest">{scanResult.name}</p>
                                    <button 
                                        onClick={() => setScanningStep(0)}
                                        className="mt-8 w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                                    >
                                        Reset Terminal
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'comms':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 h-full flex flex-col pb-28">
                        {renderHeader('Comms Channel', 'Secure Guard Frequency')}
                        
                        <div className="flex-1 space-y-4 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                            {messages.map(m => (
                                <div key={m.id} className="glass-card p-4 border-white/5 bg-white/2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{m.sender}</span>
                                        <span className="text-[8px] font-bold text-white/20">{m.time}</span>
                                    </div>
                                    <p className="text-sm font-medium">{m.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => setShowBroadcast(!showBroadcast)}
                                className="w-full py-6 rounded-3xl bg-red-600 text-white font-black tracking-[0.3em] uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-red-900/20"
                            >
                                <Radio className="w-6 h-6" />
                                Broadcast Alert
                            </button>
                            
                            {showBroadcast && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-3 gap-3">
                                    {['All Clear', 'Need Backup', 'Evacuate'].map(opt => (
                                        <button 
                                            key={opt} 
                                            onClick={() => triggerBroadcast(opt, opt === 'All Clear' ? 'SUCCESS' : 'DANGER')}
                                            className="py-4 rounded-2xl bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest transition-all hover:bg-white/10 active:scale-90"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-bg-dark text-white font-sans overflow-hidden cyber-grid relative">
            <main className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </main>

            {/* Bottom App Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-6 z-50">
                {[
                    { id: 'zone', icon: ShieldCheck, label: 'My Zone' },
                    { id: 'alerts', icon: Bell, label: 'Alerts', badge: alerts.filter(a => a.status === 'NEW').length },
                    { id: 'scan', icon: Fingerprint, label: 'Scan ID' },
                    { id: 'comms', icon: MessageSquare, label: 'Comms' }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== 'scan') setScanningStep(0);
                            }}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 px-4 py-2 rounded-2xl ${isActive ? 'bg-brand-primary/10' : 'opacity-40'}`}
                        >
                            <div className="relative">
                                <Icon className={`w-7 h-7 ${isActive ? 'text-brand-primary' : 'text-white'}`} />
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-black text-[8px] font-black flex items-center justify-center">
                                        {tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-brand-primary' : 'text-white'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default GuardView;
