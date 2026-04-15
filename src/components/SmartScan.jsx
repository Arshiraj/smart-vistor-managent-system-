import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Cpu, Fingerprint, Camera, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import FaceScanner from './FaceScanner';
import { useSecurity } from '../context/SecurityContext';

const SmartScan = ({ setActiveTab }) => {
    const { addVisitor } = useSecurity();
    const [step, setStep] = useState(1); // 1: Scan, 2: Details, 3: Success
    const [scanData, setScanData] = useState({
        name: '',
        purpose: '',
        status: 'Waiting for identity...',
        confidence: 0,
        biometricOk: false,
        idToken: ''
    });

    const handleIdentify = (result) => {
        if (result.verified || result.id === 'V-NEW') {
            setScanData(prev => ({
                ...prev,
                name: result.id === 'V-NEW' ? '' : result.name,
                idToken: result.id,
                status: result.verified ? 'IDENTITY VERIFIED' : 'GUEST REGISTRATION',
                confidence: result.confidence,
                biometricOk: result.verified,
                purpose: result.verified ? 'Authorized Visit' : ''
            }));
            // Advance to details
            setTimeout(() => setStep(2), 1500);
        } else {
            setScanData(prev => ({
                ...prev,
                status: 'UNKNOWN ENTITY',
                confidence: result.confidence,
                biometricOk: false
            }));
        }
    };

    const handleComplete = (e) => {
        e.preventDefault();

        // Add to global state
        addVisitor({
            name: scanData.name,
            purpose: scanData.purpose,
            status: 'Checked In',
            idToken: scanData.idToken || `V-${Math.floor(Math.random()*9000)+1000}`
        });
        setStep(3);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* Multi-step progress tracker */}
            <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500 ${step >= s ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-[0_0_15px_rgba(0,242,254,0.3)]' : 'border-white/10 text-white/20'}`}>
                            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </div>
                        {s < 3 && <div className={`w-20 h-0.5 rounded-full ${step > s ? 'bg-brand-primary' : 'bg-white/10'}`} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Neural Biometric Scan</h3>
                            <p className="text-white/40 mt-2">Initialize identity matching via AI facial recognition node.</p>
                        </div>

                        <FaceScanner onIdentify={handleIdentify} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Node Status', value: scanData.status, icon: Camera },
                                { label: 'Confidence Score', value: `${(scanData.confidence * 100).toFixed(1)}%`, icon: Cpu },
                                { label: 'Auth Token', value: scanData.idToken || 'PENDING', icon: Fingerprint },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card p-4 flex items-center gap-4 bg-white/2 border-white/5">
                                    <div className="p-2 rounded-lg bg-white/5 text-brand-primary">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">{stat.label}</p>
                                        <p className="text-xs font-bold text-white/90">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-10 max-w-2xl mx-auto border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Identity Tokenized</h3>
                                <p className="text-white/40 text-sm">Please finalize check-in details for the entry log.</p>
                            </div>
                        </div>

                        <form onSubmit={handleComplete} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Verified Name</label>
                                <input
                                    type="text"
                                    value={scanData.name}
                                    onChange={(e) => setScanData({ ...scanData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-brand-primary/50 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Purpose of Visit</label>
                                <input
                                    type="text"
                                    value={scanData.purpose}
                                    onChange={(e) => setScanData({ ...scanData, purpose: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 focus:border-brand-primary/50 outline-none transition-all placeholder:text-white/10"
                                    placeholder="Enter reason for visit"
                                    required
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-brand-primary text-bg-dark font-black tracking-[0.3em] uppercase rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,242,254,0.3)]"
                                >
                                    AUTHORIZE ACCESS
                                    <ShieldCheck className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full mt-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] hover:text-white"
                                >
                                    Discard and Rescan
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-20"
                    >
                        <div className="relative mx-auto w-32 h-32">
                            <div className="absolute inset-0 bg-brand-primary opacity-20 blur-3xl rounded-full animate-pulse" />
                            <div className="relative w-full h-full rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 bg-emerald-500/10">
                                <ShieldCheck className="w-16 h-16" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-emerald-400">ACCESS GRANTED</h2>
                            <p className="text-white/40 mt-3 max-w-sm mx-auto leading-relaxed">
                                Security identification successfully tokenized. Digital pass issued for <strong>Reception Zone</strong>.
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartScan;
