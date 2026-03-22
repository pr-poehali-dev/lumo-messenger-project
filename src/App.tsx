import { useState, useEffect } from 'react';
import { Screen, User } from '@/types';
import { AuthScreen, RegisterScreen } from '@/components/AuthScreens';
import { MainApp } from '@/components/AppShell';
import { api } from '@/api';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const sid = localStorage.getItem('lumo_session');
    if (!sid) { setChecking(false); return; }
    api.auth.me().then(res => {
      if (res.ok) { setCurrentUser(res.data); setScreen('app'); }
      setChecking(false);
    });
  }, []);

  const handleLogin = (user: User) => { setCurrentUser(user); setScreen('app'); };
  const handleRegister = (user: User) => { setCurrentUser(user); setScreen('app'); };
  const handleLogout = () => {
    api.auth.logout();
    localStorage.removeItem('lumo_session');
    setCurrentUser(null);
    setScreen('auth');
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="text-center">
        <h1 className="text-4xl font-black lumo-gradient-text font-display mb-4">Lumo</h1>
        <span className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin inline-block" />
      </div>
    </div>
  );

  if (screen === 'auth') return <AuthScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />;
  if (screen === 'register') return <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen('auth')} />;
  if (screen === 'app' && currentUser) return <MainApp currentUser={currentUser} onUpdateUser={setCurrentUser} onLogout={handleLogout} />;
  return null;
}
