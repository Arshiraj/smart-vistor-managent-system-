import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Clock, ArrowUpRight, ShieldAlert, Activity, AlertTriangle, CheckCircle, Volume2, VolumeX, FileText } from 'lucide-react';
import { securityEngine, SEVERITY } from '../lib/alertsEngine';

// New Components
import FloorPlan from './FloorPlan';
import ThreatGraph from './ThreatGraph';
import VisitorTimeline from './VisitorTimeline';
import { generateIncidentReport } from '../utils/reportGenerator';
import { useSecurity } from '../context/SecurityContext';

const Dashboard = () => {
    const { alerts, visitors, setVisitors, broadcasts, config } = useSecurity();
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    useEffect(() => {
        // Initialize movement loop if visitors exist
        if (visitors.length === 0) return;

        const telemetryLoop = setInterval(() => {
            setVisitors(prev => prev.map(v => {
                const newX = Math.max(0.1, Math.min(0.9, (v.x || 0.5) + (Math.random() - 0.5) * 0.05));
                const newY = Math.max(0.1, Math.min(0.9, (v.y || 0.5) + (Math.random() - 0.5) * 0.05));
                
                let zone = 'Reception';
                if (newX > 0.45) zone = 'Zone-A';
                if (newY > 0.5) zone = 'Zone-B';
                if (newX > 0.75) zone = 'Restricted';
                if (newX > 0.9) zone = 'Server Room';

                const isThreat = Math.random() > 0.99;
                const newScore = isThreat ? 0.85 : Math.max(0.05, (v.threatScore || 0.1) + (Math.random() - 0.5) * 0.02);

                const updatedVisitor = { ...v, x: newX, y: newY, currentZone: zone, threatScore: newScore };
                
                if (isThreat && (v.threatScore || 0) < 0.7) {
                    securityEngine.processEvent(
                        { type: 'TELEMETRY' }, 
                        { visitorId: v.id, x: newX, y: newY, thermal: 38.5, sentiment: 'Agitated', currentZoneName: zone, accessLevel: 1 }
                    );
                }

                return updatedVisitor;
            }));
        }, 3000);

        return () => {
            clearInterval(telemetryLoop);
        };
    }, [visitors.length]);

    const toggleVoice = () => {
        const newState = !voiceEnabled;
        setVoiceEnabled(newState);
        securityEngine.setVoiceAlerts(newState);
    };

    const stats = [
        { label: 'Total Visitors Today', value: '24', icon: Users, color: 'text-blue-400', trend: '+12%' },
        { label: 'Currently in Building', value: visitors.length.toString().padStart(2, '0'), icon: UserCheck, color: 'text-emerald-400', trend: '-2%' },
        { label: 'Active Alerts', value: alerts.filter(a => a.status === 'NEW').length.toString().padStart(2, '0'), icon: ShieldAlert, color: 'text-rose-400', trend: 'LIVE' },
        { label: 'Avg. Check-in Time', value: '1.2m', icon: Clock, color: 'text-amber-400', trend: '-15%' },
    ];

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case SEVERITY.CRITICAL: return 'border-red-500/50 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            case SEVERITY.HIGH: return 'border-orange-500/50 bg-orange-500/10 text-orange-500';
            case SEVERITY.MEDIUM: return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
            case SEVERITY.AI_PREDICTED: return 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]';
            default: return 'border-blue-500/50 bg-blue-500/10 text-blue-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <AnimatePresence>
                {broadcasts.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-600 px-4 py-3 flex items-center justify-center gap-4 overflow-hidden sticky top-0 z-50 shadow-[0_4px_30px_rgba(220,38,38,0.5)]"
                    >
                        <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">GUARD BROADCAST: {msg.message}</span>
                        <span className="text-[10px] font-bold text-white/60">T: {msg.time}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Security HQ Dashboard</h2>
                    <p className="text-white/50 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        AI Neural Surveillance v2.0-STP Online
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Voice Toggle */}
                    <button
                        onClick={toggleVoice}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${voiceEnabled ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary' : 'border-white/10 text-white/40'}`}
                    >
                        {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{voiceEnabled ? 'Voice Alerts ON' : 'Muted'}</span>
                    </button>
                    
                    <button
                        onClick={() => securityEngine.processEvent({ type: 'TELEMETRY' }, { 
                            x: 0.89, y: 0.12, thermal: 38.2, sentiment: 'Agitated', accessLevel: 1, currentZoneName: 'Main Vault Corridor' 
                        })}
                        className="glass-button flex items-center gap-2 text-[10px] font-bold tracking-widest hover:border-brand-primary/50 text-brand-primary uppercase"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Force AI Alert
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 group hover:border-brand-primary/30 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-brand-primary'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.label}</h3>
                        <p className={`text-3xl font-bold mt-1 tabular-nums ${stat.label === 'Active Alerts' && alerts.some(a => a.status === 'NEW') ? 'text-red-400 animate-pulse' : ''}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Spatial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Heatmap Floorplan */}
                <div className="lg:col-span-2">
                    <FloorPlan visitors={visitors} alerts={alerts} />
                    <div className="mt-8">
                        <ThreatGraph visitors={visitors} />
                    </div>
                </div>

                {/* Right Column: Alert Queue & Unified History */}
                <div className="space-y-8 flex flex-col h-full">
                    {/* Live Threats */}
                    <div className="glass-card p-8 bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/20 flex flex-col h-[500px]">
                        <h3 className="font-bold flex items-center justify-between mb-6">
                            <span className="flex items-center gap-2 text-lg">
                                <ShieldAlert className="w-5 h-5 text-brand-primary" />
                                Monitoring Queue
                            </span>
                            {alerts.filter(a => a.status === 'NEW').length > 0 && (
                                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-[10px] font-bold animate-pulse">ACTION REQUIRED</span>
                            )}
                        </h3>

                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            <AnimatePresence mode="popLayout">
                                {alerts.filter(a => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').reverse().slice(0, 5).map((alert) => (
                                    <motion.div
                                        key={alert.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`p-5 rounded-2xl border ${getSeverityStyles(alert.severity)} transition-all backdrop-blur-md ${alert.status === 'ACKNOWLEDGED' ? 'opacity-40 grayscale blur-[0.5px]' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <Activity className={`w-4 h-4 ${alert.severity === SEVERITY.AI_PREDICTED ? 'animate-pulse' : ''}`} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{alert.severity}</span>
                                            </div>
                                            <span className="text-[10px] opacity-70 font-mono bg-black/30 px-2 py-0.5 rounded">
                                                {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </span>
                                        </div>
                                        
                                        <h4 className="font-bold text-sm mb-2 tracking-tight">{alert.name}</h4>
                                        
                                        {alert.status === 'NEW' ? (
                                            <button
                                                onClick={() => securityEngine.acknowledgeAlert(alert.id)}
                                                className={`w-full mt-4 py-3 rounded-xl text-[9px] font-black tracking-[0.3em] uppercase transition-all ${
                                                    alert.severity === SEVERITY.CRITICAL 
                                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                                                    : 'bg-brand-primary text-black hover:opacity-80'
                                                }`}
                                            >
                                                Acknowledge Thread
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => generateIncidentReport(alert)}
                                                className="w-full mt-4 py-3 rounded-xl text-[9px] font-black tracking-[0.3em] uppercase transition-all bg-white/5 border border-white/10 text-brand-primary flex items-center justify-center gap-2 hover:bg-brand-primary/10"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                Generate PDF Report
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Visitor Timeline - Integrated Spatial history */}
                    <div className="flex-1">
                        <VisitorTimeline 
                            visitorTimeline={visitors[0]?.timeline || []} 
                            visitorName={visitors[0]?.name}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
