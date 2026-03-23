import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserPlus, LogIn, Key, User, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
    onLogin: (username: string, profile: any) => void;
    onRegister: (username: string, password: string) => void;
}

export const Auth = ({ onLogin, onRegister }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Both username and password are required.');
            return;
        }

        setIsLoading(true);

        if (isLogin) {
            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    onLogin(username, data.profile);
                } else {
                    setError(data.error || 'Invalid credentials.');
                    setIsLoading(false);
                }
            } catch (err) {
                setError('Could not connect to authentication server.');
                setIsLoading(false);
            }
        } else {
            // For registration, we pass credentials to App for Enrollment flow
            onRegister(username, password);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-cyber-dark/80 border border-cyber-primary/50 p-8 rounded-xl backdrop-blur-xl shadow-[0_0_30px_rgba(0,243,255,0.1)] relative overflow-hidden">
                    {/* Animated Edge */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-primary/20 to-transparent w-[200%] h-1"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="text-center mb-8">
                        <ShieldCheck className="w-16 h-16 text-cyber-primary mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
                        <h2 className="text-3xl font-orbitron font-bold text-white tracking-widest">
                            {isLogin ? 'SYSTEM ACCESS' : 'NEW MATRIX'}
                        </h2>
                        <p className="text-cyber-light/60 font-mono text-xs mt-2 uppercase tracking-widest">
                            {isLogin ? 'Authenticate Identity' : 'Calibrate Neural Profile'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-xs font-mono text-cyber-light/80 uppercase">
                                <User size={14} /> Subject Designation
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 p-3 rounded text-white focus:outline-none focus:border-cyber-primary font-mono transition-colors"
                                placeholder="Enter Username"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-xs font-mono text-cyber-light/80 uppercase">
                                <Key size={14} /> Encryption Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 p-3 rounded text-white focus:outline-none focus:border-cyber-primary font-mono transition-colors pr-10"
                                    placeholder="Enter Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-900/30 border border-red-500/50 p-3 rounded text-red-400 text-xs font-mono"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-cyber-primary/10 border border-cyber-primary text-cyber-primary font-orbitron font-bold uppercase tracking-widest rounded hover:bg-cyber-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">PROCESSING...</span>
                            ) : isLogin ? (
                                <><LogIn size={18} /> ENTER MATRIX</>
                            ) : (
                                <><UserPlus size={18} /> INITIALIZE SEQUENCE</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-white/10 pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-xs font-mono text-cyber-light/60 hover:text-cyber-primary transition-colors uppercase tracking-wider"
                        >
                            {isLogin ? 'Initiate New Registration Protocol' : 'Switch To Authentication Protocol'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
