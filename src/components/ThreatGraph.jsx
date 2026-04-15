import React, { useState, useEffect, useMemo } from 'react';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ReferenceLine, 
    Dot
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

const ThreatGraph = ({ visitors = [] }) => {
    const [history, setHistory] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(prev => prev + 1);
            
            setHistory(prevHistory => {
                const timestamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
                const newSnap = { timestamp, timeIndex: currentTime };
                
                // Add probability for each visitor
                visitors.forEach(v => {
                    newSnap[v.id] = v.threatScore || 0;
                });
                
                const updatedHistory = [...prevHistory, newSnap];
                // Keep only last 60 seconds of data
                return updatedHistory.slice(-60);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [visitors, currentTime]);

    const visitorColors = useMemo(() => {
        const colors = ['#00f2fe', '#4facfe', '#f093fb', '#f6d365', '#ff0844', '#10b981', '#fbbf24', '#8b5cf6'];
        const map = {};
        visitors.forEach((v, i) => {
            map[v.id] = colors[i % colors.length];
        });
        return map;
    }, [visitors]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card bg-black/90 p-4 border-brand-primary/20 backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase text-white/40 mb-3 tracking-widest flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-brand-primary" />
                        Inference Snapshot @ {label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry) => {
                            const visitor = visitors.find(v => v.id === entry.dataKey);
                            return (
                                <div key={entry.dataKey} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-xs font-bold text-white/80">{visitor?.name || entry.dataKey}</span>
                                    </div>
                                    <span className={`text-xs font-mono font-black ${entry.value > 0.75 ? 'text-red-500' : 'text-brand-primary'}`}>
                                        {(entry.value * 100).toFixed(1)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomizedDot = (props) => {
        const { cx, cy, stroke, payload, dataKey } = props;
        const value = payload[dataKey];
        if (value > 0.75) {
            return (
                <motion.circle 
                    cx={cx} cy={cy} r={4} fill="#ef4444" 
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.8, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="shadow-[0_0_10px_#ef4444]"
                />
            );
        }
        return <circle cx={cx} cy={cy} r={3} fill={stroke} strokeWidth={2} stroke="#000" />;
    };

    return (
        <div className="glass-card p-8 h-full min-h-[400px] flex flex-col relative overflow-hidden group">
            {/* Background scanline effect */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,242,254,0.1)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="font-bold flex items-center gap-2 text-lg uppercase tracking-wider text-brand-primary">
                        <Activity className="w-5 h-5" />
                        Live Neural Threat Probability
                    </h3>
                    <p className="text-[10px] text-white/40 mt-1 uppercase font-bold flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-primary animate-ping" />
                        Real-time Inference Stream (v2.0-STP)
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Threshold: 0.75</span>
                </div>
            </div>

            <div className="flex-1 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                            dataKey="timestamp" 
                            stroke="#ffffff20" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis 
                            domain={[0, 1]} 
                            stroke="#ffffff20" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            ticks={[0, 0.25, 0.5, 0.75, 1]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine 
                            y={0.75} 
                            stroke="#ef4444" 
                            strokeDasharray="5 5" 
                            strokeWidth={1} 
                            label={{ position: 'right', value: 'ALERT', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        
                        {visitors.map((v) => (
                            <Line
                                key={v.id}
                                type="monotone"
                                dataKey={v.id}
                                stroke={visitorColors[v.id]}
                                strokeWidth={2}
                                dot={<CustomizedDot dataKey={v.id} />}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                isAnimationActive={false}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* AI Insight Footer */}
            <div className="mt-6 p-4 rounded-xl bg-white/2 border border-white/5 backdrop-blur-md relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
                             System Latency
                        </p>
                        <p className="text-xl font-mono font-bold text-white tracking-tight">12.4ms</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Confidence Interval</p>
                        <p className="text-xl font-mono font-bold text-emerald-400">99.2%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatGraph;
