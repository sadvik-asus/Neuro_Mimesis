import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBiometricRecorder } from '../hooks/useBiometricRecorder';
import { extractFeatures, type FeatureVector } from '../utils/analysis';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';

interface EnrollmentProps {
    username: string;
    password: string;
    onComplete: (profile: FeatureVector, username: string) => void;
}

const PHRASES = [
    "The quick brown fox jumps over the lazy dog",
    "Sphinx of black quartz, judge my vow",
    "Pack my box with five dozen liquor jugs"
];

export const Enrollment = ({ onComplete, username, password }: EnrollmentProps) => {
    const [step, setStep] = useState(0);
    const [text, setText] = useState("");
    const [samples, setSamples] = useState<FeatureVector[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { reset, getSample } = useBiometricRecorder(true);

    const currentPhrase = PHRASES[step % PHRASES.length];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 3) {
            setIsRegistering(true);
            setError(null);

            const profile: FeatureVector = {
                meanDwellTime: samples.reduce((a, b) => a + b.meanDwellTime, 0) / samples.length,
                stdDwellTime: samples.reduce((a, b) => a + b.stdDwellTime, 0) / samples.length,
                meanFlightTime: samples.reduce((a, b) => a + b.meanFlightTime, 0) / samples.length,
                stdFlightTime: samples.reduce((a, b) => a + b.stdFlightTime, 0) / samples.length,
                mouseEntropy: samples.reduce((a, b) => a + b.mouseEntropy, 0) / samples.length,
                mouseVelocityMean: samples.reduce((a, b) => a + b.mouseVelocityMean, 0) / samples.length,
                pathStraightness: samples.reduce((a, b) => a + b.pathStraightness, 0) / samples.length,
                jerkVariance: samples.reduce((a, b) => a + b.jerkVariance, 0) / samples.length,
                scrollBurstiness: samples.reduce((a, b) => a + b.scrollBurstiness, 0) / samples.length,
            };

            try {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, profile })
                });

                if (response.ok) {
                    onComplete(profile, username);
                } else {
                    const data = await response.json();
                    setError(data.error || "Registration failed");
                    setIsRegistering(false);
                }
            } catch (err) {
                setError("Could not connect to security server.");
                setIsRegistering(false);
            }
            return;
        }

        if (text !== currentPhrase) {
            setError("Please type the phrase exactly as shown.");
            return;
        }

        setError(null);
        const rawSample = getSample();
        const features = extractFeatures(rawSample);

        const newSamples = [...samples, features];
        setSamples(newSamples);

        setText("");
        reset();
        setStep(step + 1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-2xl mx-auto z-10 relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                    className="w-full glass-panel p-10 rounded-3xl"
                >
                    <div className="mb-10 flex justify-center">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border border-cyber-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)] relative"
                        >
                            <div className="absolute inset-0 rounded-full border-t-2 border-cyber-primary animate-spin" style={{ animationDuration: '3s' }}/>
                            <BrainCircuit className="w-10 h-10 text-cyber-primary" />
                        </motion.div>
                    </div>

                    {step < 3 ? (
                        <>
                            <h2 className="text-3xl font-orbitron font-bold gradient-text mb-4">
                                Neural Calibration {step + 1}/3
                            </h2>
                            <p className="text-gray-400 mb-10 font-light text-sm tracking-wide">
                                Type the phrase below naturally. We are mapping your cognitive latency and motor patterns.
                            </p>

                            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 mb-8">
                                <p className="text-lg font-mono text-cyber-light tracking-wide select-none">
                                    {currentPhrase}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={handleInputChange}
                                    className="w-full glass-input text-xl font-mono p-5 text-center text-cyber-light rounded-2xl focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-shadow"
                                    placeholder="Type here..."
                                    autoFocus
                                    onPaste={(e) => e.preventDefault()}
                                    autoComplete="off"
                                />
                                {error && <p className="text-red-400 font-mono text-xs mt-4">{error}</p>}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={text.length === 0}
                                    className="mt-10 w-full py-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-xl text-white font-orbitron font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                >
                                    SUBMIT PATTERN
                                </motion.button>
                            </form>

                            <div className="mt-10 flex gap-3 justify-center">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="h-1.5 w-16 rounded-full overflow-hidden bg-black/50 border border-white/5">
                                        <div className={`h-full bg-cyber-primary transition-all duration-700 ease-out ${i < samples.length ? 'w-full' : 'w-0'}`} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/50"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </motion.div>
                            <h2 className="text-3xl font-orbitron font-bold text-green-400 mb-4 glow-text">
                                Calibration Complete
                            </h2>
                            <p className="text-gray-400 mb-10 text-sm">
                                Your neural profile is ready. Finalizing registration for <strong className="text-white">{username}</strong>.
                            </p>
                            <form onSubmit={handleSubmit} className="w-full">
                                {error && <p className="text-red-400 font-mono text-xs mb-6 block animate-pulse">{error}</p>}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isRegistering}
                                    className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-xl text-black font-orbitron font-bold uppercase tracking-widest disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                >
                                    {isRegistering ? 'ENCRYPTING MATRIX...' : 'FINALIZE REGISTRATION'}
                                </motion.button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
