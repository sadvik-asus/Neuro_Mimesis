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
            onRegister(username, password);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="glass-panel p-10 rounded-2xl relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-primary/10 to-transparent w-[200%] h-1"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="text-center mb-10 flex flex-col items-center">
                        <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 mb-6 rounded-2xl glass-panel flex items-center justify-center border border-cyber-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        >
                            <ShieldCheck className="w-10 h-10 text-cyber-primary" />
                        </motion.div>
                        <h2 className="text-3xl font-orbitron font-bold gradient-text tracking-widest pb-1">
                            {isLogin ? 'SYSTEM ACCESS' : 'NEW MATRIX'}
                        </h2>
                        <p className="text-gray-400 font-mono text-xs mt-3 uppercase tracking-[0.2em]">
                            {isLogin ? 'Authenticate Identity' : 'Calibrate Neural Profile'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-mono text-gray-300 uppercase tracking-wide">
                                <User size={14} className="text-cyber-primary"/> Subject Designation
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full glass-input rounded-xl p-4 text-sm tracking-wider"
                                placeholder="Enter Username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-mono text-gray-300 uppercase tracking-wide">
                                <Key size={14} className="text-cyber-primary"/> Encryption Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full glass-input rounded-xl p-4 text-sm tracking-wider pr-12"
                                    placeholder="Enter Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-primary transition-colors"
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
                                    className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs font-mono text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-xl text-white font-orbitron font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">PROCESSING...</span>
                            ) : isLogin ? (
                                <><LogIn size={20} /> ENTER MATRIX</>
                            ) : (
                                <><UserPlus size={20} /> INITIALIZE SEQUENCE</>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-xs font-mono text-gray-400 hover:text-cyber-primary transition-colors uppercase tracking-[0.1em]"
                        >
                            {isLogin ? 'Initiate New Registration Protocol' : 'Switch To Authentication Protocol'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
