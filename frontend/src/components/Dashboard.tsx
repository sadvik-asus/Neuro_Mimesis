import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, ShieldAlert, RotateCcw, Lock, Camera, Siren, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface DashboardProps {
    result: { score: number, isBot: boolean };
    onRetry: () => void;
}

export const Dashboard = ({ result, onRetry }: DashboardProps) => {
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
        // 1. Initial Alarm
        setNotification({
            message: "INTRUDER DETECTED",
            subtext: "INITIATING ACTIVE DEFENSE PROTOCOLS",
            color: 'red',
            icon: Siren
        });

        await new Promise(r => setTimeout(r, 2000));

        // 2. Capture Evidence
        setNotification({
            message: "CAPTURING EVIDENCE",
            subtext: "SMILE FOR THE CAMERA 📸",
            color: 'red',
            icon: Camera
        });
        fetch('http://localhost:5000/api/test/capture', { method: 'POST' }).catch(console.error);

        await new Promise(r => setTimeout(r, 2000));

        // 3. Evidence Secured
        setNotification({
            message: "EVIDENCE SECURED",
            subtext: "UPLOADING TO SECURE SERVER...",
            color: 'green',
            icon: ShieldCheck
        });

        await new Promise(r => setTimeout(r, 1500));

        // 4. Countdown Lock
        for (let i = 3; i > 0; i--) {
            setNotification({
                message: `SYSTEM LOCK IN ${i}...`,
                subtext: "SAVING WORKSTATION STATE",
                color: 'red',
                icon: Lock
            });
            await new Promise(r => setTimeout(r, 1000));
        }

        // 5. Lock
        setNotification({
            message: "SYSTEM LOCKED",
            subtext: "ACCESS RESTRICTED",
            color: 'red',
            icon: Lock
        });
        fetch('http://localhost:5000/api/test/lock', { method: 'POST' }).catch(console.error);

        // Clear after a while (if user unlocks)
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
                <div className="relative overflow-hidden rounded-lg p-4 bg-cyber-dark/80 border border-cyber-primary/50 shadow-[0_4px_20px_0_rgba(0,243,255,0.3)] backdrop-blur-md z-50 min-w-[200px]">
                    <motion.div
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(0,243,255,0.6)_50%,transparent_75%)] bg-[length:250%_250%] pointer-events-none"
                    />
                    <div className="relative z-10">
                        <p className="font-orbitron font-bold text-cyber-primary glow-text mb-2 text-lg">
                            {label}
                        </p>
                        <p className="font-mono text-xs text-white mb-4 opacity-90 leading-relaxed">
                            {metricExplanations[label] || "Analyzed cognitive metric"}
                        </p>
                        <div className="space-y-1 font-mono text-[10px] uppercase">
                            <div className="flex justify-between items-center text-cyber-primary opacity-60">
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 max-w-5xl mx-auto w-full relative pt-24">

            {/* CONTINUOUS TRUST BAR */}
            <div className="fixed top-0 left-0 w-full bg-cyber-dark/90 border-b border-white/10 p-4 z-40 backdrop-blur-xl flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-6 h-6 ${trustScore > 75 ? 'text-green-500' : trustScore > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="font-orbitron font-bold text-sm uppercase tracking-wider hidden md:inline-block">Continuous Trust Model</span>
                </div>
                <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trustScore}%` }}
                        transition={{ type: 'tween' }}
                        className={`absolute top-0 left-0 h-full ${trustScore > 75 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : trustScore > 40 ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                    />
                </div>
                <div className="font-mono text-xl w-16 text-right font-bold">
                    {Math.round(trustScore)}%
                </div>
            </div>

            {/* CINEMATIC NOTIFICATION OVERLAY */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            {notification.icon && <notification.icon className={`w-32 h-32 mb-8 ${notification.color === 'red' ? 'text-red-500' : notification.color === 'orange' ? 'text-orange-500' : 'text-green-500'}`} />}
                        </motion.div>

                        <h1 className={`text-6xl md:text-8xl font-black font-orbitron text-center mb-4 ${notification.color === 'red' ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]' :
                            notification.color === 'orange' ? 'text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]' :
                                'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]'
                            }`}>
                            {notification.message}
                        </h1>

                        <p className="text-2xl font-mono text-white/80 tracking-widest text-center animate-pulse">
                            {notification.subtext}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Left Col: Result */}
                <div className="bg-cyber-dark/80 border border-t border-l border-white/10 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                    <div className={`absolute top-0 w-full h-1 ${isAuth ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_20px_rgba(0,255,0,0.5)]`} />

                    {isAuth ? (
                        <ShieldCheck className="w-24 h-24 text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
                    ) : (
                        <ShieldAlert className="w-24 h-24 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                    )}

                    <h2 className={`text-4xl font-orbitron font-bold mb-2 ${isAuth ? 'text-green-400' : 'text-red-500'}`}>
                        {isAuth ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </h2>

                    <p className="text-xl font-mono mb-8 text-center text-gray-400">
                        {isBot
                            ? "ARTIFICIAL LATENCY DETECTED. NO HUMAN ERROR FOUND."
                            : isAuth
                                ? "COGNITIVE SIGNATURE MATCHED. WELCOME, USER."
                                : "BIOMETRIC ENTROPY MISMATCH. ANOMALY DETECTED."}
                    </p>

                    <div className="w-full bg-gray-900 rounded-full h-4 mb-2 overflow-hidden border border-gray-700">
                        <div
                            className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-600'}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2 w-full">
                        <p className="font-mono text-sm text-gray-500">HUMANITY SCORE: {Math.round(score)}/100</p>
                        {location && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-dark/50 border border-cyber-primary/30 rounded-full text-xs font-mono text-cyber-primary drop-shadow-[0_0_5px_rgba(0,243,255,0.3)]"
                            >
                                <MapPin size={12} className="animate-pulse" />
                                <span>{location.toUpperCase()}</span>
                            </motion.div>
                        )}
                    </div>

                    <button
                        onClick={onRetry}
                        className="mt-12 flex items-center gap-2 px-6 py-2 border border-white/20 hover:bg-white/5 rounded transition-all font-orbitron text-sm uppercase tracking-wider"
                    >
                        <RotateCcw size={16} /> Re-Initialize
                    </button>
                </div>

                {/* Right Col: Viz */}
                <div className="bg-cyber-dark/80 border border-t border-l border-white/10 rounded-xl p-6 backdrop-blur-xl flex flex-col relative overflow-hidden group">
                    <h3 className="text-xl font-orbitron text-cyber-primary mb-6 flex items-center gap-2 relative z-10">
                        <span className="w-2 h-8 bg-cyber-primary block" />
                        Biometric Analysis
                    </h3>

                    <div className="h-64 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Radar
                                    name="Baseline"
                                    dataKey="B"
                                    stroke="#00f3ff"
                                    strokeWidth={2}
                                    fill="#00f3ff"
                                    fillOpacity={0.1}
                                />
                                <Radar
                                    name="Current Attempt"
                                    dataKey="A"
                                    stroke={isBot ? '#ff00ff' : '#00ff9d'}
                                    strokeWidth={3}
                                    fill={isBot ? '#ff00ff' : '#00ff9d'}
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
                        <div className="bg-white/5 p-3 rounded">
                            <p className="text-cyber-primary">MOUSE_ENTROPY</p>
                            <p className="text-xl text-white">{isBot ? '0.00' : '4.21'} <span className="text-gray-600">bits</span></p>
                        </div>
                        <div className="bg-white/5 p-3 rounded relative z-10">
                            <p className="text-cyber-primary">DWELL_VAR</p>
                            <p className="text-xl text-white">{isBot ? '0ms' : '23ms'} <span className="text-gray-600">σ</span></p>
                        </div>
                    </div>

                    {/* Removed Liquid Glass Explanation Hover */}
                </div>
            </motion.div>

            {/* Active Defense Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <button
                    onClick={triggerActiveDefense}
                    className="group bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                >
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-orbitron text-red-400">ACTIVE DEFENSE</h3>
                    <p className="text-xs text-red-300/60 font-mono mt-2 text-center">TRIGGER INTRUDER PROTOCOL</p>
                </button>

                <button
                    onClick={triggerSafetyProtocol}
                    className="group bg-orange-900/20 border border-orange-500/50 hover:bg-orange-900/40 hover:border-orange-500 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
                >
                    <ShieldCheck className="w-12 h-12 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-orbitron text-orange-400">SAFETY PROTOCOL</h3>
                    <p className="text-xs text-orange-300/60 font-mono mt-2 text-center">INITIATE SAFE MODE</p>
                </button>
            </motion.div>
        </div>
    );
};
