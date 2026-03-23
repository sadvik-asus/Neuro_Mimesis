import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Mail, Phone, Server, MapPin } from 'lucide-react';

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
        carrier: 'vtext.com' // Default to Verizon
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
            setError("Destination email and phone number are required for security protocols.");
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
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-20 fixed"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-cyber-dark fixed"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="z-20 w-full max-w-md flex flex-col items-center"
            >
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary filter drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                        NEURO-MIMESIS
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-cyber-light font-light tracking-widest uppercase">
                        Cognitive Identity Verification
                    </p>

                    {location && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-cyber-dark/80 border border-cyber-primary/30 rounded-full text-xs font-mono text-cyber-primary"
                        >
                            <MapPin size={14} className="animate-pulse" />
                            <span>NODE LOCATION DETECTED: {location.toUpperCase()}</span>
                        </motion.div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!showConfig ? (
                        <motion.button
                            key="init-btn"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                            onClick={handleStart}
                            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-cyber-primary text-cyber-primary font-orbitron font-bold uppercase tracking-wider hover:text-cyber-dark transition-colors duration-300 w-64"
                        >
                            <span className="absolute inset-0 w-full h-full bg-cyber-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                            <span className="relative z-10">Initialize System</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="config-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="w-full bg-cyber-dark/80 border border-cyber-secondary/50 p-6 rounded-xl backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,85,0.1)]"
                        >
                            <div className="flex items-center gap-3 mb-6 border-b border-cyber-secondary/30 pb-4">
                                <ShieldAlert className="text-cyber-secondary w-6 h-6 animate-pulse" />
                                <h3 className="text-xl font-orbitron text-white">Alert Configuration</h3>
                            </div>

                            <p className="text-xs font-mono text-gray-400 mb-6 leading-relaxed">
                                CRITICAL: Configure the emergency broadcast channels. These credentials are used strictly locally to dispatch photo-evidence and coordinates to your devices if the system is breached by an imposter.
                            </p>

                            <div className="space-y-4 font-mono text-sm">
                                <div>
                                    <label className="flex items-center gap-2 text-cyber-light/70 mb-1"><Mail size={14} /> Destination Email</label>
                                    <input
                                        type="email" name="email" value={config.email} onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none placeholder-gray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-cyber-light/70 mb-1"><Phone size={14} /> Phone Number</label>
                                        <input
                                            type="text" name="phone" value={config.phone} onChange={handleInputChange}
                                            placeholder="5551234567"
                                            className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none placeholder-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-cyber-light/70 mb-1"><Server size={14} /> Carrier Setup</label>
                                        <select
                                            name="carrier" value={config.carrier} onChange={handleInputChange}
                                            className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                                        >
                                            <option value="vtext.com">Verizon</option>
                                            <option value="txt.att.net">AT&T</option>
                                            <option value="tmomail.net">T-Mobile</option>
                                            <option value="messaging.sprintpcs.com">Sprint</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="mt-4 p-2 bg-red-900/30 border border-red-500 rounded text-red-400 text-xs font-mono">{error}</div>}

                            <button
                                onClick={handleStart}
                                disabled={isConfiguring}
                                className="mt-8 w-full group relative px-8 py-3 bg-cyber-secondary/20 overflow-hidden rounded border border-cyber-secondary text-cyber-secondary font-orbitron font-bold uppercase tracking-wider hover:text-black transition-colors duration-300 disabled:opacity-50"
                            >
                                <span className="absolute inset-0 w-full h-full bg-cyber-secondary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isConfiguring ? 'CONNECTING...' : 'ARM SYSTEM'}
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="fixed bottom-4 text-xs text-cyber-light/50 font-mono tracking-widest z-0 pointer-events-none">
                SYSTEM STATUS: {showConfig ? 'AWAITING CONFIG' : 'ONLINE'} // BIOMETRIC SENSORS: STANDBY
            </div>
        </div>
    );
};
