import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Bell, Clock, Cpu, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-bg-dark/40 backdrop-blur-xl z-30 sticky top-0">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
                        <ShieldCheck className="text-brand-primary w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none">SECURE<span className="text-brand-primary">ACCESS</span></h1>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1 ml-0.5">Neural Node #402</p>
                    </div>
                </div>

                {/* Global Search */}
                <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/2 border border-white/5 w-96 group hover:border-brand-primary/30 transition-all">
                    <Search className="w-4 h-4 text-white/30 group-hover:text-brand-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search logs, visitors, or zones..." 
                        className="bg-transparent border-none outline-none text-xs text-white/70 w-full placeholder:text-white/10"
                    />
                    <span className="text-[10px] font-black text-white/10 border border-white/5 px-1.5 py-0.5 rounded">⌘K</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 border-r border-white/5 pr-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-brand-primary" />
                            <span className="text-[10px] font-bold text-white/50 tracking-wider">LATENCY</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-primary">12.4ms</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/50 tracking-wider">NETWORK</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-500">STABLE</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Time Display */}
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-0.5">Sync Time</span>
                        <span className="text-sm font-mono font-bold text-white/80">
                            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>

                    <button className="p-3 rounded-xl bg-white/2 border border-white/5 text-white/40 hover:text-brand-primary hover:bg-brand-primary/10 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-bg-dark" />
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-white/90">Jyoti</span>
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">System Admin</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-[1px]">
                            <div className="w-full h-full rounded-[11px] bg-bg-dark flex items-center justify-center overflow-hidden">
                                <User className="w-6 h-6 text-white/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
