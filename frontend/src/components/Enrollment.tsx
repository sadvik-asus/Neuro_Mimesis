import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBiometricRecorder } from '../hooks/useBiometricRecorder';
import { extractFeatures, type FeatureVector } from '../utils/analysis';
import { BrainCircuit } from 'lucide-react';

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

        // Final Registration Step
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

        // Typing Steps
        if (text !== currentPhrase) {
            setError("Please type the phrase exactly as shown.");
            return;
        }

        setError(null);
        // Process sample
        const rawSample = getSample();
        const features = extractFeatures(rawSample);

        const newSamples = [...samples, features];
        setSamples(newSamples);

        setText("");
        reset();

        setStep(step + 1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center max-w-2xl mx-auto">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
            >
                <div className="mb-8 flex justify-center">
                    <BrainCircuit className="w-16 h-16 text-cyber-secondary animate-pulse" />
                </div>

                {step < 3 ? (
                    <>
                        <h2 className="text-3xl font-orbitron font-bold text-cyber-primary mb-2">
                            Neural Calibration {step + 1}/3
                        </h2>
                        <p className="text-cyber-light/70 mb-8">
                            Please type the phrase below naturally. We are mapping your cognitive latency and motor patterns.
                        </p>

                        <div className="bg-cyber-dark/50 p-6 rounded-lg border border-cyber-primary/30 mb-8 backdrop-blur-sm">
                            <p className="text-xl font-mono text-white tracking-wide select-none">
                                {currentPhrase}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full">
                            <input
                                type="text"
                                value={text}
                                onChange={handleInputChange}
                                className="w-full bg-cyber-dark border-b-2 border-cyber-primary/50 text-xl font-mono p-4 focus:outline-none focus:border-cyber-secondary focus:bg-cyber-primary/5 transition-all text-center text-cyber-light"
                                placeholder="Type here..."
                                autoFocus
                                onPaste={(e) => e.preventDefault()}
                            />
                            {error && <p className="text-red-500 font-mono text-xs mt-2">{error}</p>}

                            <button
                                type="submit"
                                disabled={text.length === 0}
                                className="mt-8 px-8 py-3 bg-cyber-primary/10 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black transition-all font-orbitron font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                SUBMIT PATTERN
                            </button>
                        </form>

                        <div className="mt-8 grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className={`h-1 rounded-full overflow-hidden bg-gray-800`}>
                                    <div className={`h-full bg-cyber-secondary transition-all duration-500 ${i < samples.length ? 'w-full' : 'w-0'}`} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-orbitron font-bold text-green-400 mb-2">
                            Calibration Complete
                        </h2>
                        <p className="text-cyber-light/70 mb-8">
                            Your neural profile is ready. Finalizing registration for <strong className="text-white">{username}</strong>.
                        </p>
                        <form onSubmit={handleSubmit} className="w-full">
                            {error && <p className="text-red-500 font-mono text-xs mb-4 block animate-pulse">{error}</p>}

                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="mt-4 px-8 py-3 w-full bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition-all font-orbitron font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                            >
                                {isRegistering ? 'ENCRYPTING MATRIX...' : 'FINALIZE REGISTRATION'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};
