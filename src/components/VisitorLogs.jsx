import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, User, Calendar, Tag, Shield, MoreVertical } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

const VisitorLogs = () => {
    const { visitors } = useSecurity();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = visitors.filter(v => {
        const idToken = v.idToken || v.id || '';
        const purpose = v.purpose || v.org || '';
        return v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               idToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
               purpose.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Visitor Audit Logs</h2>
                    <p className="text-white/40 text-sm italic">Historical access records with AI sentiment analysis.</p>
                </div>
                <div className="flex gap-3">
                    <button className="glass-button flex items-center gap-2 text-xs font-bold">
                        <Download className="w-4 h-4" />
                        EXPORT DATA
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/2 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or purpose..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-brand-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="glass-button p-2 bg-white/5 border-white/10">
                            <Filter className="w-4 h-4" />
                        </button>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer hover:bg-white/10 transition-all">
                            <option value="all">All Status</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                <th className="px-6 py-4">Visitor / ID</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4">Check-in Time</th>
                                <th className="px-6 py-4">Sentiment</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredHistory.map((v, i) => (
                                <motion.tr
                                    key={v.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-white/2 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                                                {v.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold tracking-wide">{v.name}</p>
                                                <p className="text-[10px] font-mono text-white/30">{v.idToken || v.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-white/60">{v.purpose || v.org || 'General'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono">{v.time}</span>
                                            <span className="text-[10px] text-white/20">Today</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3 h-3 text-brand-secondary" />
                                            <span className="text-xs text-brand-secondary italic">{v.sentiment || (v.flagged ? 'Agitated' : 'Calm')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-400">LOW</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${v.status === 'Checked In'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-white/5 border-white/10 text-white/40'
                                            }`}>
                                            {v.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-white/20 hover:text-white transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredHistory.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-white/20 text-sm">No visitor records found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default VisitorLogs;
