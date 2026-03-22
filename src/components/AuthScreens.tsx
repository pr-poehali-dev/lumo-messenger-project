import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { User, generateCaptcha } from '@/types';

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────────
export function AuthScreen({ onLogin, onGoRegister }: { onLogin: (user: User) => void; onGoRegister: () => void }) {
  const [tag, setTag] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!tag || !password) { setError('Заполни все поля'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tag === '#admin' && password === 'admin') {
        onLogin({ id: 1, nickname: 'Администратор', tag: '#admin', role: 'admin', description: 'Главный администратор Lumo' });
      } else if (tag.startsWith('#') && password.length >= 4) {
        onLogin({ id: 1, nickname: tag.replace('#', ''), tag, role: 'user', description: '' });
      } else {
        setError('Неверный тег или пароль');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0d1117' }}>
      <div className="lumo-noise" />
      <div className="lumo-glow-orb w-96 h-96 -top-48 -left-48 opacity-20" style={{ background: '#7c3aed' }} />
      <div className="lumo-glow-orb w-96 h-96 -bottom-48 -right-48 opacity-20" style={{ background: '#ec4899' }} />

      <div className="relative z-10 w-full max-w-sm px-6 animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black lumo-gradient-text font-display mb-2">Lumo</h1>
          <p className="text-white/40 text-sm">мессенджер нового поколения</p>
        </div>

        <div className="lumo-card rounded-2xl p-7 space-y-4">
          <div className="space-y-1">
            <label className="text-white/50 text-xs uppercase tracking-widest">Тег</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">#</span>
              <input
                className="lumo-input w-full rounded-xl py-3 pl-8 pr-4 text-sm"
                placeholder="твой_тег"
                value={tag.replace('#', '')}
                onChange={e => setTag('#' + e.target.value.replace('#', ''))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white/50 text-xs uppercase tracking-widest">Пароль</label>
            <input
              type="password"
              className="lumo-input w-full rounded-xl py-3 px-4 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="lumo-btn-primary w-full rounded-xl py-3 font-semibold text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Входим...
              </span>
            ) : 'Войти'}
          </button>

          <p className="text-center text-white/30 text-sm pt-1">
            Нет аккаунта?{' '}
            <button onClick={onGoRegister} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Зарегистрироваться
            </button>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Подсказка: войди как <span className="text-purple-400">#admin</span> / пароль: <span className="text-purple-400">admin</span>
        </p>
      </div>
    </div>
  );
}

// ─── REGISTER SCREEN ────────────────────────────────────────────────────────────
export function RegisterScreen({ onRegister, onGoLogin }: { onRegister: (user: User) => void; onGoLogin: () => void }) {
  const [nickname, setNickname] = useState('');
  const [tag, setTag] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (!nickname || !tag) { setError('Заполни все поля'); return; }
    if (!tag.match(/^[a-zA-Z0-9_]+$/)) { setError('Тег: только буквы, цифры и _'); return; }
    setError(''); setStep(2);
  };

  const handleRegister = () => {
    if (!password || !confirm) { setError('Введи пароль'); return; }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    if (captchaInput.toUpperCase() !== captcha) { setError('Неверная капча'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister({ id: Date.now(), nickname, tag: '#' + tag, role: 'user', description: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0d1117' }}>
      <div className="lumo-noise" />
      <div className="lumo-glow-orb w-96 h-96 -top-48 -right-48 opacity-20" style={{ background: '#a855f7' }} />
      <div className="lumo-glow-orb w-64 h-64 bottom-20 -left-32 opacity-15" style={{ background: '#ec4899' }} />

      <div className="relative z-10 w-full max-w-sm px-6 animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black lumo-gradient-text font-display mb-2">Lumo</h1>
          <p className="text-white/40 text-sm">создай свой аккаунт</p>
        </div>

        <div className="lumo-card rounded-2xl p-7">
          <div className="flex gap-1 mb-6">
            {[1, 2].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ background: 'var(--lumo-gradient)', width: step >= s ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-white font-semibold text-lg">Придумай имя и тег</h2>
              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Никнейм</label>
                <input className="lumo-input w-full rounded-xl py-3 px-4 text-sm" placeholder="Как тебя зовут?" value={nickname} onChange={e => setNickname(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Твой #тег</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">#</span>
                  <input className="lumo-input w-full rounded-xl py-3 pl-8 pr-4 text-sm" placeholder="уникальный_тег" value={tag} onChange={e => setTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} />
                </div>
                <p className="text-white/30 text-xs">Только буквы, цифры и _ . Изменить нельзя!</p>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleNext} className="lumo-btn-primary w-full rounded-xl py-3 font-semibold text-sm">Далее →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-white font-semibold text-lg">Пароль и проверка</h2>
              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Пароль</label>
                <input type="password" className="lumo-input w-full rounded-xl py-3 px-4 text-sm" placeholder="минимум 6 символов" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Повтор пароля</label>
                <input type="password" className="lumo-input w-full rounded-xl py-3 px-4 text-sm" placeholder="повтори пароль" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-white/50 text-xs uppercase tracking-widest">Капча</label>
                <div className="rounded-xl py-4 px-4 text-center select-none" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                  <span className="font-mono text-3xl font-black tracking-[0.5em] lumo-gradient-text" style={{ filter: 'blur(0.4px)' }}>
                    {captcha}
                  </span>
                </div>
                <input className="lumo-input w-full rounded-xl py-3 px-4 text-sm" placeholder="Введи символы выше" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setStep(1); setError(''); }} className="flex-1 rounded-xl py-3 font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>← Назад</button>
                <button onClick={handleRegister} disabled={loading} className="lumo-btn-primary flex-1 rounded-xl py-3 font-semibold text-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Создаём...
                    </span>
                  ) : 'Создать аккаунт'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-white/30 text-sm pt-4">
            Уже есть аккаунт?{' '}
            <button onClick={onGoLogin} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Войти</button>
          </p>
        </div>
      </div>
    </div>
  );
}
