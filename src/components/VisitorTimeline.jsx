import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ShieldAlert, CheckCircle2, AlertTriangle, ChevronRight, Cpu } from 'lucide-react';

const VisitorTimeline = ({ visitorTimeline = [], visitorName = "Visitor" }) => {
    // Reverse chronological order
    const chronoSorted = [...visitorTimeline].reverse();

    return (
        <div className="glass-card p-8 h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white/2 to-transparent group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/2 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/5 transition-colors" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="font-bold flex items-center gap-2 text-lg uppercase tracking-wider text-brand-primary">
                    <Clock className="w-5 h-5" />
                    Spatial History Timeline
                </h3>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                    Live Stream
                </div>
            </div>

            <div className="flex-1 relative z-10 overflow-y-auto px-1 custom-scrollbar">
                {chronoSorted.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                        <MapPin className="w-12 h-12 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Movement Data</p>
                        <p className="text-[10px] mt-2 italic">Waiting for trajectory updates...</p>
                    </div>
                ) : (
                    <div className="relative border-l border-white/5 ml-4 pl-8 space-y-8">
                        {chronoSorted.map((node, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative group/node"
                            >
                                {/* Time marker dot */}
                                <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-bg-dark transition-all duration-500 ${
                                    node.isSuspicious ? 'bg-rose-500 animate-pulse' : 'bg-brand-primary'
                                }`}>
                                    {node.isSuspicious ? <ShieldAlert className="w-2.5 h-2.5 text-white" /> : <MapPin className="w-2.5 h-2.5 text-black" />}
                                </div>

                                <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all ${
                                    node.isSuspicious 
                                    ? 'bg-rose-500/5 border-rose-500/20 group-hover/node:border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                                    : 'bg-white/2 border-white/5 group-hover/node:border-brand-primary/30 group-hover/node:bg-white/5 shadow-lg shadow-black/20'
                                }`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${node.isSuspicious ? 'text-rose-400' : 'text-brand-primary'}`}>
                                                {node.zone}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[10px] font-mono text-white/40">{node.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Dwell</p>
                                            <p className="text-[10px] font-mono font-bold text-white/80">{node.dwellTime || '0.5'}s</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-white/90">
                                            {node.isSuspicious ? 'Anomalous Entry Detected' : 'Authorized Movement'}
                                        </h4>
                                        <ChevronRight className={`w-4 h-4 transition-all ${node.isSuspicious ? 'text-rose-400' : 'text-white/10 group-hover/node:text-brand-primary'}`} />
                                    </div>

                                    {/* AI evidence chain for suspicious entries */}
                                    {node.isSuspicious && node.evidence && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="mt-4 pt-4 border-t border-rose-500/20 space-y-2 overflow-hidden"
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2 mb-2">
                                                <Cpu className="w-3.5 h-3.5" />
                                                Neural Evidence Chain
                                            </p>
                                            {node.evidence.map((line, lIdx) => (
                                                <div key={lIdx} className="text-[10px] font-mono text-white/60 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 border-l-rose-500/40 border-l-2">
                                                    {line}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Threat Score Visualizer */}
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(node.threatScore || 0) * 100}%` }}
                                                className={`h-full ${node.isSuspicious ? 'bg-rose-500' : 'bg-brand-primary'}`} 
                                            />
                                        </div>
                                        <p className={`text-[10px] font-mono font-black ${node.isSuspicious ? 'text-rose-400' : 'text-brand-primary'}`}>
                                            {(node.threatScore || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Temporal Audit Stream</p>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest">Live Syncing</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default VisitorTimeline;
