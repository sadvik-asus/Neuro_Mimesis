import { motion } from 'framer-motion';
import { Fingerprint, Share2 } from 'lucide-react';
import type { FeatureVector } from '../utils/analysis';

interface Props {
    profile: FeatureVector;
    username: string;
    onContinue: () => void;
}

export const FingerprintCard = ({ profile, username, onContinue }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 max-w-2xl mx-auto w-full"
        >
            <div className="bg-cyber-dark/80 border border-cyber-primary/40 rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,243,255,0.1)] w-full relative overflow-hidden">

                {/* Holographic background sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-primary/10 to-transparent -translate-x-[100%] animate-[shimmer_3s_infinite]" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-orbitron font-black text-white glow-text">
                            COGNITIVE
                            <br />
                            <span className="text-cyber-primary">FINGERPRINT</span>
                        </h2>
                        <p className="font-mono text-sm text-gray-400 mt-2">ID: {username.toUpperCase()}</p>
                    </div>
                    <Fingerprint className="w-16 h-16 text-cyber-primary opacity-80" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <StatBox label="Flight Time (µ)" value={`${Math.round(profile.meanFlightTime)}ms`} desc={`σ: ${Math.round(profile.stdFlightTime)}ms`} color="text-cyber-primary" />
                    <StatBox label="Dwell Time (µ)" value={`${Math.round(profile.meanDwellTime)}ms`} desc={`σ: ${Math.round(profile.stdDwellTime)}ms`} color="text-cyber-secondary" />
                    <StatBox label="Motor Entropy" value={`${profile.mouseEntropy.toFixed(2)}`} desc="Bits / Trajectory" color="text-pink-400" />
                    <StatBox label="Kinematic Vel." value={`${Math.round(profile.mouseVelocityMean)}`} desc="px / ms" color="text-green-400" />
                </div>

                <div className="bg-black/50 rounded-lg p-4 border border-white/5 mb-8 relative z-10">
                    <p className="font-mono text-xs text-gray-400 leading-relaxed">
                        &gt; ANALYSIS COMPLETE.
                        <br />
                        &gt; YOUR NEUROMOTOR PROFILE EXHIBITS <span className="text-white font-bold">{profile.mouseEntropy > 2 ? 'HIGH ORGANIC CHAOS' : 'RIGID STRUCTURE'}</span>.
                        <br />
                        &gt; BASELINE ESTABLISHED. AWAITING VERIFICATION CHALLENGE.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={onContinue}
                        className="flex-1 bg-cyber-primary text-black font-orbitron font-bold py-3 px-6 rounded hover:bg-white transition-colors uppercase tracking-wider"
                    >
                        Proceed to Security Matrix
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/20 text-white p-3 rounded transition-colors flex items-center justify-center group">
                        <Share2 className="w-5 h-5 group-hover:text-cyber-primary transition-colors" />
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

// Helper component
const StatBox = ({ label, value, desc, color }: { label: string, value: string, desc: string, color: string }) => (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-black font-orbitron ${color} drop-shadow-[0_0_10px_currentColor]`}>{value}</p>
        <p className="text-[10px] font-mono text-gray-600 mt-1">{desc}</p>
    </div>
);
