import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ScanFace, CheckCircle2, XCircle, ShieldCheck, Cpu } from 'lucide-react';
import { biometricScanner } from '../lib/faceDetection';

const FaceScanner = ({ onIdentify }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('initializing'); // initializing, active, success, unknown
    const [result, setResult] = useState(null);

    useEffect(() => {
        let stream;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus('active');
                    await biometricScanner.init();
                }
            } catch (err) {
                console.error("Webcam Error:", err);
                setStatus('error');
            }
        };

        startVideo();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    useEffect(() => {
        if (status !== 'active') return;

        const scan = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) return;
            
            try {
                const scanResult = await biometricScanner.scanFrame(videoRef.current);
                setResult(scanResult);

                // Lowering threshold for more reliable demo flow
                if (scanResult.detected && scanResult.confidence > 0.85) {
                    if (scanResult.verified) {
                        setStatus('success');
                        setTimeout(() => onIdentify(scanResult), 1000);
                    } else {
                        setStatus('unknown');
                        // For demo, we might want to let them proceed after seeing 'Unknown'
                        // for a few seconds if they click a button?
                    }
                }
            } catch (err) {
                console.warn("[BIO-SCAN] Frame dropped or detector busy");
            }
        };

        const interval = setInterval(scan, 200);
        return () => clearInterval(interval);
    }, [status, onIdentify]);

    return (
        <div className="glass-card overflow-hidden bg-black/40 border-brand-primary/20 relative group">
            <div className="aspect-video relative overflow-hidden bg-black">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-70 transition-all duration-700"
                />
                
                {/* Scan Overlay Container */}
                <div className="absolute inset-0 z-10">
                    <AnimatePresence>
                        {result?.detected && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute',
                                    left: result.box.xMin,
                                    top: result.box.yMin,
                                    width: result.box.width,
                                    height: result.box.height,
                                    border: `2px solid ${status === 'success' ? '#10b981' : status === 'unknown' ? '#ef4444' : '#00f2fe'}`,
                                    borderRadius: '1rem',
                                    boxShadow: `0 0 20px ${status === 'success' ? 'rgba(16,185,129,0.3)' : status === 'unknown' ? 'rgba(239,68,68,0.3)' : 'rgba(0,242,254,0.3)'}`
                                }}
                            >
                                {/* Corners */}
                                <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${status === 'success' ? 'border-emerald-500' : status === 'unknown' ? 'border-rose-500' : 'border-brand-primary'}`} />
                                <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${status === 'success' ? 'border-emerald-500' : status === 'unknown' ? 'border-rose-500' : 'border-brand-primary'}`} />
                                <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${status === 'success' ? 'border-emerald-500' : status === 'unknown' ? 'border-rose-500' : 'border-brand-primary'}`} />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${status === 'success' ? 'border-emerald-500' : status === 'unknown' ? 'border-rose-500' : 'border-brand-primary'}`} handleBox={() => {}} />
                                
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-2 whitespace-nowrap">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'success' ? 'text-emerald-400' : status === 'unknown' ? 'text-rose-400' : 'text-brand-primary'}`}>
                                        {result.verified ? 'Verified Identity' : 'Unknown Pattern'}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scan line for active mode */}
                    {status === 'active' && (
                        <motion.div
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            className="absolute left-0 right-0 h-[2px] bg-brand-primary/50 shadow-[0_0_15px_#00f2fe] pointer-events-none"
                        />
                    )}
                </div>

                {/* Status HUD Overlay */}
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} `} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Bio-Terminal-01</p>
                </div>

                {/* Status Badges */}
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 m-auto w-fit h-fit px-6 py-3 bg-emerald-500 text-bg-dark font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.5)] z-20 flex items-center gap-3"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Identity Verified
                        </motion.div>
                    )}
                    {status === 'unknown' && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 m-auto w-fit h-fit px-6 py-3 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.5)] z-20 flex items-center gap-3"
                        >
                            <XCircle className="w-5 h-5" />
                            Unknown Visitor
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5 text-brand-primary">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Neural Matcher</p>
                        <p className="text-sm font-bold text-white/80">MediaPipe v2.0-FDM</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    {status === 'unknown' && (
                        <button 
                            onClick={() => onIdentify({ verified: false, name: 'NEW VISITOR', id: 'V-NEW', confidence: 0.99 })}
                            className="px-6 py-2 bg-rose-600/20 border border-rose-500/40 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all animate-pulse"
                        >
                            Guest Registration
                        </button>
                    )}
                    <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-all">
                        <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Webcam.Live</span>
                        <Camera className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceScanner;
