import { useState } from 'react';
import { Screen, User } from '@/types';
import { AuthScreen, RegisterScreen } from '@/components/AuthScreens';
import { MainApp } from '@/components/AppShell';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => { setCurrentUser(user); setScreen('app'); };
  const handleRegister = (user: User) => { setCurrentUser(user); setScreen('app'); };
  const handleLogout = () => { setCurrentUser(null); setScreen('auth'); };

  if (screen === 'auth') return <AuthScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />;
  if (screen === 'register') return <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen('auth')} />;
  if (screen === 'app' && currentUser) return <MainApp currentUser={currentUser} onUpdateUser={setCurrentUser} onLogout={handleLogout} />;
  return null;
}
