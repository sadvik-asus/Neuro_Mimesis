import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, ShieldAlert, RotateCcw, Lock, Camera, Siren, MapPin, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface DashboardProps {
    result: { score: number, isBot: boolean };
    onRetry: () => void;
    onLogout: () => void;
}

export const Dashboard = ({ result, onRetry, onLogout }: DashboardProps) => {
    const { score, isBot } = result;
    const isAuth = !isBot && score > 60;
    const [notification, setNotification] = useState<{ message: string, subtext?: string, color: 'red' | 'orange' | 'green', icon?: any } | null>(null);
    const [trustScore, setTrustScore] = useState(score);
    const hasTriggeredRef = useRef(false);
    const [location, setLocation] = useState<string | null>(null);

    useEffect(() => {
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data.city && data.region) {
                    setLocation(`${data.city}, ${data.region}`);
                }
            })
            .catch(() => {
                setLocation("LOCATION MASKED");
            });
    }, []);

    // Simulate continuous trust score degrading if not active
    useEffect(() => {
        if (!isAuth) return;
        const interval = setInterval(() => {
            setTrustScore(prev => Math.max(10, prev - Math.random() * 2)); // Slowly degrades
        }, 5000);
        return () => clearInterval(interval);
    }, [isAuth]);

    // Auto-Lockdown when Trust Score <= 30
    useEffect(() => {
        if (trustScore <= 30 && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            triggerActiveDefense();
        }
    }, [trustScore]);

    const triggerActiveDefense = async () => {
        setNotification({
            message: "INTRUDER DETECTED",
            subtext: "INITIATING ACTIVE DEFENSE PROTOCOLS",
            color: 'red',
            icon: Siren
        });
        await new Promise(r => setTimeout(r, 2000));

        setNotification({
            message: "CAPTURING EVIDENCE",
            subtext: "SMILE FOR THE CAMERA 📸",
            color: 'red',
            icon: Camera
        });
        fetch('http://localhost:5000/api/test/capture', { method: 'POST' }).catch(console.error);

        await new Promise(r => setTimeout(r, 2000));

        setNotification({
            message: "EVIDENCE SECURED",
            subtext: "UPLOADING TO SECURE SERVER...",
            color: 'green',
            icon: ShieldCheck
        });
        await new Promise(r => setTimeout(r, 1500));

        for (let i = 3; i > 0; i--) {
            setNotification({
                message: `SYSTEM LOCK IN ${i}...`,
                subtext: "SAVING WORKSTATION STATE",
                color: 'red',
                icon: Lock
            });
            await new Promise(r => setTimeout(r, 1000));
        }

        setNotification({
            message: "SYSTEM LOCKED",
            subtext: "ACCESS RESTRICTED",
            color: 'red',
            icon: Lock
        });
        fetch('http://localhost:5000/api/test/lock', { method: 'POST' }).catch(console.error);
        setTimeout(() => setNotification(null), 5000);
    };

    const triggerSafetyProtocol = async () => {
        setNotification({
            message: "SAFETY PROTOCOL ENGAGED",
            subtext: "SILENT ALARM TRIGGERED",
            color: 'orange',
            icon: ShieldCheck
        });

        fetch('http://localhost:5000/api/panic', { method: 'POST' }).catch(console.error);
        await new Promise(r => setTimeout(r, 2000));

        setNotification({
            message: "GPS COORDINATES SENT",
            subtext: "EMERGENCY CONTACTS NOTIFIED",
            color: 'orange',
            icon: ShieldCheck
        });
        setTimeout(() => setNotification(null), 3000);
    };

    const data = [
        { subject: 'Dwell Var', A: isBot ? 0 : 80, B: 90, fullMark: 100 },
        { subject: 'Flight Var', A: isBot ? 0 : 85, B: 85, fullMark: 100 },
        { subject: 'Entropy', A: isBot ? 0 : 75, B: 80, fullMark: 100 },
        { subject: 'Velocity', A: isBot ? 100 : 60, B: 65, fullMark: 100 },
        { subject: 'Rhythm', A: isBot ? 10 : 90, B: 85, fullMark: 100 },
    ];

    const metricExplanations: Record<string, string> = {
        'Dwell Var': 'How consistently you hold keys down.',
        'Flight Var': 'The rhythm and timing between your keystrokes.',
        'Entropy': 'The unique unpredictability of your mouse path.',
        'Velocity': 'How fast you naturally move the cursor.',
        'Rhythm': 'The overall cadence and fluidity of your inputs.'
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="relative overflow-hidden rounded-xl p-4 glass-panel z-50 min-w-[200px]">
                    <div className="relative z-10">
                        <p className="font-orbitron font-bold text-cyber-primary glow-text mb-2 text-lg">
                            {label}
                        </p>
                        <p className="font-mono text-xs text-white mb-4 opacity-90 leading-relaxed">
                            {metricExplanations[label] || "Analyzed cognitive metric"}
                        </p>
                        <div className="space-y-2 font-mono text-xs uppercase">
                            <div className="flex justify-between items-center text-cyber-primary opacity-80">
                                <span>Baseline:</span>
                                <span>{payload[0]?.value}%</span>
                            </div>
                            <div className="flex justify-between items-center text-green-400">
                                <span>Attempt:</span>
                                <span>{payload[1]?.value}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 max-w-5xl mx-auto w-full relative pt-24 z-10">
            {/* CONTINUOUS TRUST BAR */}
            <div className="fixed top-0 left-0 w-full glass-panel border-b border-white/5 p-4 z-40 flex items-center gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-6 h-6 ${trustScore > 75 ? 'text-green-500' : trustScore > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="font-orbitron font-bold text-sm uppercase tracking-widest hidden md:inline-block">Continuous Trust Model</span>
                </div>
                <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trustScore}%` }}
                        transition={{ type: 'tween' }}
                        className={`absolute top-0 left-0 h-full ${trustScore > 75 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : trustScore > 40 ? 'bg-yellow-500 shadow-[0_0_15px_#eab308]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`}
                    />
                </div>
                <div className="font-mono text-xl w-16 text-right font-bold text-white tracking-widest">
                    {Math.round(trustScore)}%
                </div>
                <button 
                    onClick={onLogout} 
                    className="ml-auto flex items-center gap-2 px-5 py-2 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                >
                    <LogOut size={16} />
                    <span className="hidden md:inline font-orbitron font-bold text-xs tracking-widest">LOGOUT</span>
                </button>
            </div>

            {/* CINEMATIC NOTIFICATION OVERLAY */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            {notification.icon && <notification.icon className={`w-32 h-32 mb-8 ${notification.color === 'red' ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]' : notification.color === 'orange' ? 'text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]' : 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]'}`} />}
                        </motion.div>
                        <h1 className={`text-6xl md:text-8xl font-black font-orbitron text-center mb-4 ${notification.color === 'red' ? 'text-red-500 glow-text' : notification.color === 'orange' ? 'text-orange-500 glow-text' : 'text-green-500 glow-text'}`}>
                            {notification.message}
                        </h1>
                        <p className="text-2xl font-mono text-white/80 tracking-widest text-center animate-pulse">
                            {notification.subtext}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Left Col: Result */}
                <div className="glass-panel rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className={`absolute top-0 w-full h-1.5 ${isAuth ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_20px_rgba(0,255,0,0.5)]`} />

                    {isAuth ? (
                        <ShieldCheck className="w-24 h-24 text-green-500 mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                    ) : (
                        <ShieldAlert className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                    )}

                    <h2 className={`text-4xl font-orbitron font-bold mb-4 tracking-widest ${isAuth ? 'text-green-400' : 'text-red-500'}`}>
                        {isAuth ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </h2>

                    <p className="text-lg font-mono mb-10 text-center text-gray-400 leading-relaxed">
                        {isBot
                            ? "ARTIFICIAL LATENCY DETECTED. NO HUMAN ERROR FOUND."
                            : isAuth
                                ? "COGNITIVE SIGNATURE MATCHED. WELCOME, USER."
                                : "BIOMETRIC ENTROPY MISMATCH. ANOMALY DETECTED."}
                    </p>

                    <div className="flex flex-col items-center gap-5 w-full mb-8">
                        {/* Identity Match Score */}
                        <div className="w-full">
                             <div className="flex justify-between font-mono text-xs mb-1.5 text-gray-400 tracking-widest uppercase">
                                 <span>Identity Match</span>
                                 <span className="text-white font-bold">{Math.round(score)}%</span>
                             </div>
                             <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                                 <div className={`h-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${score > 80 ? 'bg-cyber-primary text-cyber-primary' : score > 50 ? 'bg-yellow-500 text-yellow-500' : 'bg-red-500 text-red-500'}`} style={{ width: `${score}%` }} />
                             </div>
                        </div>

                        {/* Humanity Score */}
                        <div className="w-full">
                             <div className="flex justify-between font-mono text-xs mb-1.5 text-gray-400 tracking-widest uppercase">
                                 <span>Humanity Index</span>
                                 <span className="text-white font-bold">{isBot ? '12%' : '99%'}</span>
                             </div>
                             <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                                 <div className={`h-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${isBot ? 'bg-red-500 text-red-500' : 'bg-green-500 text-green-500'}`} style={{ width: isBot ? '12%' : '99%' }} />
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4 w-full">
                        {location && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 border border-cyber-primary/20 rounded-full text-xs font-mono text-cyber-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                <MapPin size={14} className="animate-pulse" />
                                <span>{location.toUpperCase()}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onRetry}
                        className="mt-12 flex items-center gap-3 px-8 py-3 glass-panel rounded-xl hover:border-cyber-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-orbitron font-bold text-sm uppercase tracking-widest"
                    >
                        <RotateCcw size={18} className="text-cyber-primary" /> Re-Initialize
                    </button>
                </div>

                {/* Right Col: Viz */}
                <div className="glass-panel rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-8 flex items-center gap-3 relative z-10 tracking-widest">
                        <span className="w-2 h-8 bg-gradient-to-b from-cyber-primary to-cyber-secondary block rounded-full" />
                        Biometric Analysis
                    </h3>

                    <div className="h-64 w-full relative z-10 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Radar
                                    name="Baseline"
                                    dataKey="B"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Current Attempt"
                                    dataKey="A"
                                    stroke={isBot ? '#ef4444' : '#22c55e'}
                                    strokeWidth={3}
                                    fill={isBot ? '#ef4444' : '#22c55e'}
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <p className="text-cyber-primary mb-1 tracking-wider">MOUSE_ENTROPY</p>
                            <p className="text-2xl font-bold text-white">{isBot ? '0.00' : '4.21'} <span className="text-gray-500 text-sm">bits</span></p>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 relative z-10">
                            <p className="text-cyber-primary mb-1 tracking-wider">DWELL_VAR</p>
                            <p className="text-2xl font-bold text-white">{isBot ? '0ms' : '23ms'} <span className="text-gray-500 text-sm">σ</span></p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Active Defense Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <button
                    onClick={triggerActiveDefense}
                    className="group glass-panel border border-red-500/20 hover:border-red-500/50 hover:bg-red-900/20 rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                >
                    <ShieldAlert className="w-14 h-14 text-red-500 mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <h3 className="text-2xl font-orbitron font-bold text-red-400 tracking-widest">ACTIVE DEFENSE</h3>
                    <p className="text-sm text-red-400/60 font-mono mt-2 tracking-widest text-center">TRIGGER INTRUDER PROTOCOL</p>
                </button>

                <button
                    onClick={triggerSafetyProtocol}
                    className="group glass-panel border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-900/20 rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                >
                    <ShieldCheck className="w-14 h-14 text-orange-500 mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    <h3 className="text-2xl font-orbitron font-bold text-orange-400 tracking-widest">SAFETY PROTOCOL</h3>
                    <p className="text-sm text-orange-400/60 font-mono mt-2 tracking-widest text-center">INITIATE SAFE MODE</p>
                </button>
            </motion.div>
        </div>
    );
};
