import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Mail, Phone, Server, MapPin, ChevronRight, Lock } from 'lucide-react';

export interface AlertConfig {
    email: string;
    phone: string;
    carrier: string;
}

interface IntroProps {
    onStart: (config: AlertConfig) => void;
}

export const Intro = ({ onStart }: IntroProps) => {
    const [showConfig, setShowConfig] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({
        email: '',
        phone: '',
        carrier: 'vtext.com'
    });
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleStart = async () => {
        if (!showConfig) {
            setShowConfig(true);
            return;
        }

        if (!config.email || !config.phone) {
            setError("Destination email and phone number are required.");
            return;
        }

        setIsConfiguring(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/configure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                onStart(config);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to configure defense system.");
                setIsConfiguring(false);
            }
        } catch (err) {
            setError("Could not connect to security server for configuration.");
            setIsConfiguring(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-20 w-full max-w-lg flex flex-col items-center"
            >
                <div className="text-center mb-10 flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="w-20 h-20 mb-6 rounded-2xl glass-panel flex items-center justify-center border border-cyber-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    >
                        <Lock className="text-cyber-primary w-10 h-10" />
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl font-orbitron font-bold gradient-text pb-2">
                        NEURO-MIMESIS
                    </h1>
                    <p className="mt-3 text-sm md:text-base text-gray-400 font-light tracking-[0.2em] uppercase">
                        Cognitive Identity Verification
                    </p>

                    {location && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-xs font-mono text-cyber-accent border border-cyber-accent/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        >
                            <MapPin size={14} />
                            <span>NODE LOCATION: {location.toUpperCase()}</span>
                        </motion.div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!showConfig ? (
                        <motion.button
                            key="init-btn"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStart}
                            className="group flex items-center justify-between px-8 py-4 w-72 glass-panel rounded-full text-white font-orbitron font-semibold uppercase tracking-widest border border-white/10 hover:border-cyber-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
                        >
                            <span>Initialize</span>
                            <ChevronRight className="w-5 h-5 text-cyber-primary group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="config-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full glass-panel p-8 rounded-2xl border border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                <ShieldAlert className="text-cyber-secondary w-6 h-6" />
                                <h3 className="text-xl font-orbitron font-semibold text-white">Alert Configuration</h3>
                            </div>

                            <p className="text-xs text-gray-400 mb-8 leading-relaxed font-light">
                                Configure the emergency broadcast channels. These credentials dispatch photo-evidence and coordinates if the system is breached by an imposter.
                            </p>

                            <div className="space-y-5 text-sm">
                                <div>
                                    <label className="flex items-center gap-2 text-gray-300 mb-2 font-medium"><Mail size={14} className="text-cyber-primary"/> Destination Email</label>
                                    <input
                                        type="email" name="email" value={config.email} onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        className="w-full glass-input rounded-lg p-3"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-2 font-medium"><Phone size={14} className="text-cyber-primary"/> Phone Number</label>
                                        <input
                                            type="text" name="phone" value={config.phone} onChange={handleInputChange}
                                            placeholder="5551234567"
                                            className="w-full glass-input rounded-lg p-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 mb-2 font-medium"><Server size={14} className="text-cyber-primary"/> Carrier Setup</label>
                                        <select
                                            name="carrier" value={config.carrier} onChange={handleInputChange}
                                            className="w-full glass-input rounded-lg p-3"
                                        >
                                            <option value="vtext.com" className="bg-cyber-dark text-white">Verizon</option>
                                            <option value="txt.att.net" className="bg-cyber-dark text-white">AT&T</option>
                                            <option value="tmomail.net" className="bg-cyber-dark text-white">T-Mobile</option>
                                            <option value="messaging.sprintpcs.com" className="bg-cyber-dark text-white">Sprint</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStart}
                                disabled={isConfiguring}
                                className="mt-8 w-full py-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-lg text-white font-orbitron font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all"
                            >
                                {isConfiguring ? 'CONNECTING...' : 'ARM SYSTEM'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
