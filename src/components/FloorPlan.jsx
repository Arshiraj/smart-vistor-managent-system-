import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, User, ShieldAlert } from 'lucide-react';

const ZONES = {
    RECEPTION: { id: 'Reception', color: '#00f2fe', coords: 'M 50,50 L 250,50 L 250,200 L 50,200 Z' },
    ZONE_A: { id: 'Zone-A', color: '#4facfe', coords: 'M 250,50 L 450,50 L 450,200 L 250,200 Z' },
    ZONE_B: { id: 'Zone-B', color: '#f093fb', coords: 'M 50,200 L 250,200 L 250,350 L 50,350 Z' },
    RESTRICTED: { id: 'Restricted', color: '#f6d365', coords: 'M 250,200 L 450,200 L 450,350 L 250,350 Z' },
    SERVER_ROOM: { id: 'Server Room', color: '#ff0844', coords: 'M 450,50 L 550,50 L 550,350 L 450,350 Z' }
};

const FloorPlan = ({ visitors = [], alerts = [] }) => {
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [activeZones, setActiveZones] = useState([]);

    useEffect(() => {
        // Find zones with active alerts
        const alertingZones = alerts
            .filter(a => a.status === 'NEW')
            .map(a => a.context?.zone || a.context?.targetZone)
            .filter(Boolean);
        setActiveZones(alertingZones);
    }, [alerts]);

    const getVisitorColor = (visitor) => {
        const alert = alerts.find(a => a.context?.visitorId === visitor.id && a.status === 'NEW');
        if (!alert) return '#10b981'; // Green (Safe)
        if (alert.severity === 'CRITICAL' || alert.severity === 'AI_PREDICTED') return '#ef4444'; // Red (Threat)
        return '#f59e0b'; // Yellow (Suspicious)
    };

    return (
        <div className="relative glass-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 text-lg uppercase tracking-wider text-brand-primary">
                    <MapPin className="w-5 h-5" />
                    Spatial Threat Map
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white/40">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Suspicious
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white/40">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Threat
                    </div>
                </div>
            </div>

            <div className="relative aspect-[16/10] bg-black/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
                <svg viewBox="0 0 600 400" className="w-full h-full">
                    {/* Definitions for Glow Effects */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Zone Polygons */}
                    {Object.values(ZONES).map((zone) => (
                        <g key={zone.id}>
                            <motion.path
                                d={zone.coords}
                                fill="transparent"
                                stroke={zone.color}
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                animate={{
                                    fill: activeZones.includes(zone.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                    stroke: activeZones.includes(zone.id) ? '#ef4444' : zone.color,
                                    strokeWidth: activeZones.includes(zone.id) ? 3 : 2
                                }}
                                transition={{
                                    repeat: activeZones.includes(zone.id) ? Infinity : 0,
                                    duration: 1,
                                    repeatType: "reverse"
                                }}
                            />
                            <text 
                                x={parseInt(zone.coords.split(' ')[1]) + 20} 
                                y={parseInt(zone.coords.split(' ')[2]) + 30}
                                fill={zone.color}
                                className="text-[10px] font-black uppercase tracking-widest opacity-40 select-none"
                            >
                                {zone.id}
                            </text>
                        </g>
                    ))}

                    {/* Visitor Dots */}
                    {visitors.map((visitor) => (
                        <motion.g
                            key={visitor.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1,
                                x: visitor.x * 600,
                                y: visitor.y * 400
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVisitor(visitor);
                            }}
                            className="cursor-pointer"
                        >
                            {/* Pulse effect for threats */}
                            {getVisitorColor(visitor) !== '#10b981' && (
                                <motion.circle
                                    r="12"
                                    fill={getVisitorColor(visitor)}
                                    initial={{ opacity: 0.4, scale: 0.8 }}
                                    animate={{ opacity: 0, scale: 2 }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                            )}
                            <circle
                                r="6"
                                fill={getVisitorColor(visitor)}
                                className="shadow-lg"
                                filter="url(#glow)"
                            />
                            <motion.circle
                                r="8"
                                stroke={getVisitorColor(visitor)}
                                strokeWidth="2"
                                fill="transparent"
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.5 }}
                            />
                        </motion.g>
                    ))}
                </svg>

                {/* Visitor Detail Popup */}
                <AnimatePresence>
                    {selectedVisitor && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-8 left-8 right-8 glass-card bg-black/80 p-4 border-brand-primary/30 flex items-center gap-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary border border-brand-primary/30">
                                {selectedVisitor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-wide">{selectedVisitor.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> ID: {selectedVisitor.idToken || 'V-TEMP'}
                                    </p>
                                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Zone: {selectedVisitor.currentZone || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase text-white/30 mb-1">Threat Score</p>
                                <p className={`text-lg font-mono font-bold ${getVisitorColor(selectedVisitor) === '#ef4444' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {(selectedVisitor.threatScore || 0).toFixed(2)}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedVisitor(null)}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-colors"
                            >
                                <User className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State Overlay */}
                {visitors.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 select-none">
                        <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Active Visitors</p>
                        <p className="text-[10px] mt-2 italic">Waiting for telemetry ingestion...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloorPlan;
