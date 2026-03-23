import { useState } from 'react';
import { Intro } from './components/Intro';
import { Enrollment } from './components/Enrollment';
import { Auth } from './components/Auth';
import { Verification } from './components/Verification'; // Will create next
import { Dashboard } from './components/Dashboard'; // Will create next
import { FingerprintCard } from './components/FingerprintCard';
import { MouseHeatmap } from './components/MouseHeatmap';
import type { FeatureVector } from './utils/analysis';

function App() {
  const [view, setView] = useState<'intro' | 'auth' | 'enrollment' | 'fingerprint' | 'verification' | 'dashboard'>('intro');
  const [userProfile, setUserProfile] = useState<FeatureVector | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [lastResult, setLastResult] = useState<{ score: number, isBot: boolean } | null>(null);

  const startAuthFlow = () => setView('auth');

  const handleLogin = (uName: string, profile: FeatureVector) => {
    setUsername(uName);
    setUserProfile(profile);
    setView('verification'); // Go straight to challenge
  };

  const handleRegisterStart = (uName: string, pass: string) => {
    setUsername(uName);
    setPassword(pass);
    setView('enrollment'); // Go to train new profile
  };

  const handleEnrollmentComplete = (profile: FeatureVector, _uName: string) => {
    setUserProfile(profile);
    // username is already set from Auth, but we can set it again if needed
    setView('fingerprint');
  };

  const handleVerificationComplete = (score: number, isBot: boolean) => {
    setLastResult({ score, isBot });
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light selection:bg-cyber-secondary selection:text-white relative">
      <div className="crt-scan" />
      <div className="crt-flicker" />
      <MouseHeatmap active={true} />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center">
        {view === 'intro' && <Intro onStart={startAuthFlow} />}
        {view === 'auth' && <Auth onLogin={handleLogin} onRegister={handleRegisterStart} />}
        {view === 'enrollment' && <Enrollment onComplete={handleEnrollmentComplete} username={username} password={password} />}
        {view === 'fingerprint' && userProfile && (
          <FingerprintCard profile={userProfile} username={username} onContinue={() => setView('verification')} />
        )}
        {view === 'verification' && userProfile && (
          <Verification
            profile={userProfile}
            username={username}
            onComplete={handleVerificationComplete}
          />
        )}
        {view === 'dashboard' && lastResult && (
          <Dashboard result={lastResult} onRetry={() => setView('verification')} />
        )}
      </div>
    </div>
  );
}

export default App;
