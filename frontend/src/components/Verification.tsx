import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBiometricRecorder } from '../hooks/useBiometricRecorder';
import { extractFeatures, type FeatureVector, compareFeatures } from '../utils/analysis';
import { Lock, Shuffle, Cpu } from 'lucide-react';

interface VerificationProps {
    profile: FeatureVector; // we keep this for typing or fallback
    username: string;
    onComplete: (score: number, isBot: boolean) => void;
}

const PHRASES = [
    "Identity is not what you know but how you think",
    "The neural lace binds us to the machine",
    "Cognitive patterns are the soul of the digital age"
];

export const Verification = ({ username, onComplete }: VerificationProps) => {
    const [text, setText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getSample } = useBiometricRecorder(true);
    const [phraseIndex, setPhraseIndex] = useState(0);

    const currentPhrase = PHRASES[phraseIndex];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const verify = async (isBot: boolean = false, isSmartBot: boolean = false) => {
        setAnalyzing(true);
        setError(null);

        try {
            // First, retrieve the profile from the database
            const response = await fetch('http://localhost:5000/api/verify_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            if (!response.ok) {
                const errData = await response.json();
                setError(errData.error || "User verification failed on server.");
                setAnalyzing(false);
                return;
            }

            const data = await response.json();
            const dbProfile = data.profile as FeatureVector;

            // Wait a bit for cinematic effect
            await new Promise(r => setTimeout(r, 1500));

            let score = 0;

            if (isBot) {
                // Dumb bot has 0 entropy, 0 variance, perfect speed
                const botSample: FeatureVector = {
                    meanDwellTime: 50, // fast fixed speed
                    stdDwellTime: 0,
                    meanFlightTime: 50,
                    stdFlightTime: 0,
                    mouseEntropy: 0,
                    mouseVelocityMean: 0,
                    pathStraightness: 1.0,
                    jerkVariance: 0,
                    scrollBurstiness: 0
                };
                score = compareFeatures(dbProfile, botSample);
            } else if (isSmartBot) {
                // Smart Bot tries to fake variance using math curves
                const smartBotSample: FeatureVector = {
                    meanDwellTime: dbProfile.meanDwellTime * 0.9,
                    stdDwellTime: 5, // Fake constant variance
                    meanFlightTime: dbProfile.meanFlightTime * 1.1,
                    stdFlightTime: 8,
                    mouseEntropy: 1.5, // Fake low entropy
                    mouseVelocityMean: dbProfile.mouseVelocityMean,
                    pathStraightness: 0.96, // Just slightly imperfect but still too straight
                    jerkVariance: 0.05, // Too smooth
                    scrollBurstiness: 0
                };
                score = compareFeatures(dbProfile, smartBotSample);
            } else {
                const rawSample = getSample();
                const sample = extractFeatures(rawSample);
                score = compareFeatures(dbProfile, sample);
            }

            onComplete(score, isBot || isSmartBot);

        } catch (err) {
            setError("Cannot connect to remote verification matrix.");
            setAnalyzing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verify(false);
    };

    const simulateBot = (smartMode: boolean = false) => {
        if (isSimulating || analyzing) return;

        setIsSimulating(true);
        setText("");

        const targetText = currentPhrase;
        let index = 0;

        const typeNext = () => {
            if (index < targetText.length) {
                setText(targetText.substring(0, index + 1));
                index++;

                // Smart bot fakes human typing delays using a sine wave function + tiny random noise
                // Dumb bot is precisely 50ms every time
                let delay = 50;
                if (smartMode) {
                    const noise = Math.sin(index * 0.5) * 20 + (Math.random() * 5); // Pseudo-random human fake
                    delay = 60 + noise;
                }

                setTimeout(typeNext, delay);
            } else {
                setTimeout(() => {
                    setIsSimulating(false);
                    verify(smartMode ? false : true, smartMode ? true : false);
                }, 500);
            }
        };

        typeNext();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center max-w-2xl mx-auto">
            {analyzing ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-cyber-primary/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-t-cyber-primary border-r-transparent border-b-cyber-secondary border-l-transparent rounded-full animate-spin"></div>
                        <Cpu className="absolute inset-0 m-auto w-12 h-12 text-cyber-light animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-orbitron text-cyber-primary blink">ANALYZING BIOMETRIC ENTROPY...</h2>
                    <div className="mt-4 font-mono text-xs text-cyber-light/60">
                        <p>CALCULATING FLIGHT TIME VARIANCE...</p>
                        <p>MAPPING MOUSE MICRO-JITTERS...</p>
                        <p>VERIFYING COGNITIVE SIGNATURE...</p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                >
                    <div className="mb-8 flex justify-center">
                        <Lock className="w-16 h-16 text-cyber-primary" />
                    </div>

                    <h2 className="text-3xl font-orbitron font-bold text-white mb-8">
                        Identity Check
                    </h2>

                    <div className="bg-cyber-dark/50 p-6 rounded-lg border border-cyber-primary/30 mb-8 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-2 right-2 cursor-pointer hover:text-cyber-secondary" onClick={() => setPhraseIndex((phraseIndex + 1) % PHRASES.length)}>
                            <Shuffle size={16} />
                        </div>
                        <p className="text-xl font-mono text-white tracking-wide select-none">
                            {currentPhrase}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full relative">
                        <input
                            type="text"
                            value={text}
                            onChange={handleInputChange}
                            className="w-full bg-cyber-dark border-b-2 border-cyber-primary/50 text-xl font-mono p-4 focus:outline-none focus:border-cyber-secondary focus:bg-cyber-primary/5 transition-all text-center text-cyber-light"
                            placeholder={`Verify ID: ${username}...`}
                            autoFocus
                            onPaste={(e) => e.preventDefault()}
                        />
                        {error && <p className="text-red-500 font-mono text-xs mt-2 font-bold">{error}</p>}

                        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
                            <button
                                type="submit"
                                disabled={text !== currentPhrase}
                                className="px-8 py-3 bg-cyber-primary text-black font-orbitron font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase flex-1"
                            >
                                Verify Reality
                            </button>

                            <button
                                type="button"
                                onClick={() => simulateBot(false)}
                                disabled={isSimulating}
                                className="px-6 py-3 bg-transparent border border-pink-500 text-pink-500 font-orbitron font-bold hover:bg-pink-500/10 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Basic Script
                            </button>

                            <button
                                type="button"
                                onClick={() => simulateBot(true)}
                                disabled={isSimulating}
                                className="px-6 py-3 bg-transparent border border-orange-500 text-orange-500 font-orbitron font-bold hover:bg-orange-500/10 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed text-sm relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-orange-500/20 w-0 group-hover:w-full transition-all duration-300"></span>
                                <span className="relative">Smart Bot Evasion</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 text-xs text-cyber-light/30 border-t border-gray-800 pt-4">
                        <p>SECURE CHANNEL ESTABLISHED // TSL 1.3 // 256-BIT ENTROPY</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
