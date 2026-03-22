import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

type Screen = 'auth' | 'register' | 'app';
type AppTab = 'chats' | 'groups' | 'search' | 'contacts' | 'settings';
type SettingsTab = 'profile' | 'themes' | 'premium';
type UserRole = 'admin' | 'moder' | 'premium' | 'user';

interface User {
  id: number;
  nickname: string;
  tag: string;
  role: UserRole;
  avatar?: string;
  description?: string;
  banned?: boolean;
}

interface Message {
  id: number;
  text: string;
  senderId: number;
  timestamp: string;
  chatId: number;
}

interface Chat {
  id: number;
  name: string;
  tag: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

interface Group {
  id: number;
  name: string;
  tag: string;
  members: number;
  lastMessage: string;
  time: string;
  avatar?: string;
  description?: string;
}

const THEMES = [
  { id: 'violet', name: 'Lumo Classic', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', preview: ['#7c3aed', '#a855f7', '#ec4899'] },
  { id: 'ocean', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6)', preview: ['#0ea5e9', '#6366f1', '#8b5cf6'] },
  { id: 'fire', name: 'Solar Flare', gradient: 'linear-gradient(135deg, #f97316, #ef4444, #ec4899)', preview: ['#f97316', '#ef4444', '#ec4899'] },
  { id: 'forest', name: 'Neon Forest', gradient: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)', preview: ['#10b981', '#06b6d4', '#6366f1'] },
  { id: 'gold', name: 'Golden Hour', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)', preview: ['#f59e0b', '#ef4444', '#ec4899'] },
  { id: 'midnight', name: 'Midnight Rose', gradient: 'linear-gradient(135deg, #be185d, #7c3aed, #1d4ed8)', preview: ['#be185d', '#7c3aed', '#1d4ed8'] },
];

const MOCK_CHATS: Chat[] = [
  { id: 1, name: 'Алекс', tag: '#alexdev', lastMessage: 'Привет! Как дела?', time: '14:32', unread: 3, online: true },
  { id: 2, name: 'Мария', tag: '#mariart', lastMessage: 'Отправила тебе файл', time: '13:15', unread: 0, online: true },
  { id: 3, name: 'Дмитрий', tag: '#dmitry99', lastMessage: 'Ок, увидимся завтра', time: '11:44', unread: 1, online: false },
  { id: 4, name: 'Катя', tag: '#katya_k', lastMessage: '😂😂😂', time: 'вчера', unread: 0, online: false },
  { id: 5, name: 'Никита', tag: '#nik_tech', lastMessage: 'Посмотри это видео', time: 'вчера', unread: 7, online: true },
];

const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Dev Community', tag: '#devcom', members: 1284, lastMessage: 'alexdev: Новый релиз React 20!', time: '15:01', description: 'Сообщество разработчиков' },
  { id: 2, name: 'Дизайн & UI', tag: '#design_ui', members: 892, lastMessage: 'mariart: Крутые референсы', time: '14:22', description: 'Про дизайн и интерфейсы' },
  { id: 3, name: 'Lumo Official', tag: '#lumo_hq', members: 45672, lastMessage: 'Добро пожаловать в Lumo!', time: '09:00', description: 'Официальный канал Lumo' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 1, text: 'Привет! Как дела?', senderId: 2, timestamp: '14:30', chatId: 1 },
  { id: 2, text: 'Отлично! Работаю над новым проектом', senderId: 1, timestamp: '14:31', chatId: 1 },
  { id: 3, text: 'Звучит интересно! Что за проект?', senderId: 2, timestamp: '14:31', chatId: 1 },
  { id: 4, text: 'Мессенджер с тегами вместо номеров 😄', senderId: 1, timestamp: '14:32', chatId: 1 },
  { id: 5, text: 'О, это Lumo! Крутая идея 🚀', senderId: 2, timestamp: '14:32', chatId: 1 },
];

const MOCK_CONTACTS: User[] = [
  { id: 2, nickname: 'Алекс', tag: '#alexdev', role: 'premium', description: 'Full-stack разработчик' },
  { id: 3, nickname: 'Мария', tag: '#mariart', role: 'user', description: 'UI/UX дизайнер' },
  { id: 4, nickname: 'Дмитрий', tag: '#dmitry99', role: 'moder', description: 'Модератор' },
];

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'user') return null;
  const map = {
    admin: { label: 'Admin', className: 'lumo-role-admin' },
    moder: { label: 'Moder', className: 'lumo-role-moder' },
    premium: { label: 'Premium', className: 'lumo-role-premium' },
  };
  const cfg = map[role];
  return <span className={cfg.className + ' uppercase tracking-wider ml-1'}>{cfg.label}</span>;
}

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, onGoRegister }: { onLogin: (user: User) => void; onGoRegister: () => void }) {
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
function RegisterScreen({ onRegister, onGoLogin }: { onRegister: (user: User) => void; onGoLogin: () => void }) {
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

// ─── CHAT WINDOW ────────────────────────────────────────────────────────────────
function ChatWindow({ chat, currentUser, onBack }: { chat: Chat | Group; currentUser: User; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [pinned, setPinned] = useState<string | null>('Добро пожаловать в чат! 🎉');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: input,
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      chatId: chat.id,
    }]);
    setInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-white/60" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="lumo-avatar w-10 h-10 text-sm font-bold">{chat.name[0]}</div>
          {'online' in chat && chat.online && <div className="lumo-online-dot" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold truncate">{chat.name}</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(168,85,247,0.8)' }}>{chat.tag}</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Icon name="MoreVertical" size={18} className="text-white/40" />
        </button>
      </div>

      {pinned && (
        <div className="flex items-center gap-3 px-5 py-2 text-xs flex-shrink-0" style={{ background: 'rgba(168,85,247,0.07)', borderBottom: '1px solid rgba(168,85,247,0.12)' }}>
          <Icon name="Pin" size={12} className="text-purple-400 flex-shrink-0" />
          <span className="text-white/60 truncate">{pinned}</span>
          <button onClick={() => setPinned(null)} className="ml-auto text-white/30 hover:text-white/60">
            <Icon name="X" size={12} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map(msg => {
          const isMine = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div>
                <div className={`lumo-message-bubble ${isMine ? 'mine' : 'other'}`}>{msg.text}</div>
                <p className={`text-xs mt-1 text-white/30 ${isMine ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={18} className="text-white/40" />
          </button>
          <input
            className="lumo-input flex-1 rounded-xl py-3 px-4 text-sm"
            placeholder="Напиши сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button onClick={sendMessage} className="lumo-btn-primary p-3 rounded-xl flex-shrink-0">
            <Icon name="Send" size={18} />
          </button>
        </div>
        {currentUser.role === 'user' && (
          <p className="text-xs text-white/25 mt-2 text-center">
            Фото до 30 МБ ·{' '}
            <span className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">Premium — до 150 МБ</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CHATS TAB ──────────────────────────────────────────────────────────────────
function ChatsTab({ currentUser }: { currentUser: User }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="flex h-full">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-col border-r flex-shrink-0`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-white font-bold text-lg mb-3">Сообщения</h2>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="lumo-input w-full rounded-xl py-2.5 pl-9 pr-4 text-sm" placeholder="Поиск чатов..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {MOCK_CHATS.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: selectedChat?.id === chat.id ? 'rgba(168,85,247,0.12)' : undefined }}
              onMouseEnter={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLDivElement).style.background = ''; }}
            >
              <div className="relative flex-shrink-0">
                <div className="lumo-avatar w-11 h-11 text-base">{chat.name[0]}</div>
                {chat.online && <div className="lumo-online-dot" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm truncate">{chat.name}</span>
                  <span className="text-white/30 text-xs flex-shrink-0 ml-2">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-white/40 text-xs truncate">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="ml-2 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lumo-gradient)' }}>{chat.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} currentUser={currentUser} onBack={() => setSelectedChat(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl mb-5 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Icon name="MessageCircle" size={36} className="text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Выбери чат</h3>
            <p className="text-white/30 text-sm">Нажми на диалог слева, чтобы начать общение</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GROUPS TAB ─────────────────────────────────────────────────────────────────
function GroupsTab({ currentUser }: { currentUser: User }) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');

  return (
    <div className="flex h-full">
      <div className={`${selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-col border-r flex-shrink-0`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Группы</h2>
            <button onClick={() => setShowCreate(true)} className="lumo-btn-primary rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
              <Icon name="Plus" size={14} />Создать
            </button>
          </div>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="lumo-input w-full rounded-xl py-2.5 pl-9 pr-4 text-sm" placeholder="Найти группу..." />
          </div>
        </div>

        {showCreate && (
          <div className="mx-4 mb-3 p-4 rounded-xl animate-scale-in" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h3 className="text-white font-semibold text-sm mb-3">Новая группа</h3>
            <input className="lumo-input w-full rounded-xl py-2.5 px-4 text-sm mb-2" placeholder="Название группы" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-sm">#</span>
              <input className="lumo-input w-full rounded-xl py-2.5 pl-8 pr-4 text-sm" placeholder="тег_группы" value={newGroupTag} onChange={e => setNewGroupTag(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl py-2 text-sm text-white/50" style={{ background: 'rgba(255,255,255,0.05)' }}>Отмена</button>
              <button onClick={() => { setShowCreate(false); setNewGroupName(''); setNewGroupTag(''); }} className="lumo-btn-primary flex-1 rounded-xl py-2 text-sm font-semibold">Создать</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {MOCK_GROUPS.map(group => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: selectedGroup?.id === group.id ? 'rgba(168,85,247,0.12)' : undefined }}
              onMouseEnter={e => { if (selectedGroup?.id !== group.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (selectedGroup?.id !== group.id) (e.currentTarget as HTMLDivElement).style.background = ''; }}
            >
              <div className="lumo-avatar w-11 h-11 text-lg flex-shrink-0">{group.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm truncate">{group.name}</span>
                  <span className="text-white/30 text-xs flex-shrink-0 ml-2">{group.time}</span>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-white/40 text-xs truncate">{group.lastMessage}</span>
                  <span className="text-white/25 text-xs flex-shrink-0 ml-2">{group.members.toLocaleString('ru')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${selectedGroup ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
        {selectedGroup ? (
          <ChatWindow chat={selectedGroup} currentUser={currentUser} onBack={() => setSelectedGroup(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl mb-5 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Icon name="Users" size={36} className="text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Выбери группу</h3>
            <p className="text-white/30 text-sm">Вступай в сообщества или создай своё</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SEARCH TAB ─────────────────────────────────────────────────────────────────
function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const q = query.replace('#', '').toLowerCase();
    setResults(q ? MOCK_CONTACTS.filter(c =>
      c.tag.replace('#', '').toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)
    ) : []);
  };

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-y-auto">
      <h2 className="text-white font-bold text-lg mb-4">Поиск по тегу</h2>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">#</span>
          <input
            className="lumo-input w-full rounded-xl py-3 pl-8 pr-4 text-sm"
            placeholder="тег_пользователя"
            value={query.replace('#', '')}
            onChange={e => setQuery('#' + e.target.value.replace('#', ''))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button onClick={handleSearch} className="lumo-btn-primary rounded-xl px-5 font-semibold text-sm">
          <Icon name="Search" size={18} />
        </button>
      </div>

      {!searched ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-white font-semibold mb-2">Найди кого угодно</h3>
          <p className="text-white/30 text-sm max-w-xs">Введи #тег чтобы найти пользователя — вместо номеров телефона!</p>
          <p className="text-white/20 text-xs mt-2">Попробуй: <span className="text-purple-400">#alexdev</span> или <span className="text-purple-400">#mariart</span></p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-white font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-white/30 text-sm">Попробуй другой тег</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {results.map(user => (
            <div key={user.id} className="lumo-card rounded-2xl p-4 flex items-center gap-4">
              <div className="lumo-avatar w-12 h-12 text-lg flex-shrink-0">{user.nickname[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">{user.nickname}</span>
                  <RoleBadge role={user.role} />
                </div>
                <span className="lumo-tag text-sm">{user.tag}</span>
                {user.description && <p className="text-white/40 text-xs mt-0.5 truncate">{user.description}</p>}
              </div>
              <button className="lumo-btn-primary rounded-xl p-2.5 flex-shrink-0">
                <Icon name="MessageCircle" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CONTACTS TAB ───────────────────────────────────────────────────────────────
function ContactsTab() {
  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Контакты</h2>
        <button className="lumo-btn-primary rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
          <Icon name="UserPlus" size={14} />Добавить
        </button>
      </div>
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="lumo-input w-full rounded-xl py-2.5 pl-9 pr-4 text-sm" placeholder="Поиск контактов..." />
      </div>
      <div className="space-y-2">
        {MOCK_CONTACTS.map(contact => (
          <div key={contact.id} className="lumo-card rounded-2xl p-4 flex items-center gap-4">
            <div className="lumo-avatar w-12 h-12 text-lg flex-shrink-0">{contact.nickname[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold">{contact.nickname}</span>
                <RoleBadge role={contact.role} />
              </div>
              <span className="lumo-tag text-sm">{contact.tag}</span>
              {contact.description && <p className="text-white/40 text-xs mt-0.5 truncate">{contact.description}</p>}
            </div>
            <div className="flex gap-1">
              <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Написать">
                <Icon name="MessageCircle" size={18} className="text-purple-400" />
              </button>
              <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Удалить">
                <Icon name="UserMinus" size={18} className="text-white/30" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ───────────────────────────────────────────────────────────────
function SettingsTab({ currentUser, onUpdateUser, onLogout, theme, onThemeChange }: {
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
  theme: string;
  onThemeChange: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [description, setDescription] = useState(currentUser.description || '');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const settingsTabs = [
    { id: 'profile' as SettingsTab, label: 'Профиль', icon: 'User' },
    { id: 'themes' as SettingsTab, label: 'Темы', icon: 'Palette' },
    { id: 'premium' as SettingsTab, label: 'Premium', icon: 'Star' },
  ];

  const handleSave = () => {
    onUpdateUser({ ...currentUser, nickname, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden sm:flex flex-col w-48 border-r py-5 px-3 space-y-1 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {settingsTabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`lumo-sidebar-item ${activeTab === t.id ? 'active' : ''} w-full text-left`}>
            <Icon name={t.icon} size={18} />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onLogout} className="lumo-sidebar-item w-full text-left" style={{ color: '#f87171' }}>
          <Icon name="LogOut" size={18} />
          <span className="text-sm font-medium">Выйти</span>
        </button>
      </div>

      {/* Mobile tab bar */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="sm:hidden flex gap-2 px-4 pt-4 pb-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {settingsTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all" style={activeTab === t.id ? { background: 'var(--lumo-gradient)', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="max-w-md space-y-6 animate-fade-in">
              <h2 className="text-white font-bold text-xl">Личный кабинет</h2>

              <div className="flex items-center gap-5">
                <div className="relative cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <div className="lumo-avatar w-20 h-20 text-2xl lumo-pulse overflow-hidden">
                    {currentUser.avatar
                      ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : currentUser.nickname[0]}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--lumo-gradient)' }}>
                    <Icon name="Camera" size={14} className="text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) onUpdateUser({ ...currentUser, avatar: URL.createObjectURL(file) });
                  }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-lg">{currentUser.nickname}</span>
                    <RoleBadge role={currentUser.role} />
                  </div>
                  <span className="lumo-tag text-sm">{currentUser.tag}</span>
                  <p className="text-white/25 text-xs mt-1">Нажми на аватар чтобы изменить</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Никнейм</label>
                <input className="lumo-input w-full rounded-xl py-3 px-4 text-sm" value={nickname} onChange={e => setNickname(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">Тег</label>
                <div className="flex items-center gap-2 rounded-xl py-3 px-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', opacity: 0.6 }}>
                  <span className="text-purple-400 font-bold">#</span>
                  <span className="text-white/60">{currentUser.tag.replace('#', '')}</span>
                  <Icon name="Lock" size={14} className="ml-auto text-white/30" />
                </div>
                <p className="text-white/25 text-xs">Тег нельзя изменить после регистрации</p>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 text-xs uppercase tracking-widest">О себе</label>
                <textarea className="lumo-input w-full rounded-xl py-3 px-4 text-sm resize-none" rows={3} placeholder="Расскажи о себе..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <button onClick={handleSave} className="lumo-btn-primary rounded-xl px-6 py-3 font-semibold text-sm flex items-center gap-2">
                {saved ? <><Icon name="Check" size={16} />Сохранено!</> : 'Сохранить изменения'}
              </button>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="animate-fade-in">
              <h2 className="text-white font-bold text-xl mb-1">Темы оформления</h2>
              <p className="text-white/40 text-sm mb-6">Выбери цветовую гамму для Lumo</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
                    style={{
                      background: theme === t.id ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                      border: theme === t.id ? '2px solid rgba(168,85,247,0.5)' : '2px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="h-8 rounded-xl mb-3" style={{ background: t.gradient }} />
                    <div className="flex gap-1.5 mb-2">
                      {t.preview.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    {theme === t.id && <p className="text-purple-400 text-xs mt-0.5">✓ Активна</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'premium' && (
            <div className="animate-fade-in flex flex-col items-center text-center py-6 max-w-sm mx-auto">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #f59e0b, #a855f7)', boxShadow: '0 0 60px rgba(245,158,11,0.3)' }}>
                <Icon name="Star" size={44} className="text-white" />
              </div>
              <h2 className="text-white font-black text-3xl font-display mb-2">
                Lumo <span className="lumo-gradient-text">Premium</span>
              </h2>
              <p className="text-white/40 text-sm mb-8 max-w-xs">Отправляй файлы до 150 МБ, получи уникальный значок и поддержи развитие Lumo</p>

              <div className="space-y-3 w-full mb-8 text-left">
                {['Файлы и медиа до 150 МБ', 'Значок Premium рядом с именем', 'Приоритетная поддержка', 'Ранний доступ к новым функциям', 'Эксклюзивные темы оформления'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #a855f7)' }}>
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                    <span className="text-white/80 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://denovclient2.tilda.ws/premium"
                target="_blank"
                rel="noopener noreferrer"
                className="lumo-btn-primary rounded-2xl px-10 py-4 font-bold text-lg inline-block text-white no-underline"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #a855f7)', boxShadow: '0 0 40px rgba(168,85,247,0.4)' }}
              >
                Получить Premium ✨
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────────
function AdminPanel({ onClose }: { onClose: () => void }) {
  const mockUsers = [
    { id: 1, nickname: 'alexdev', tag: '#alexdev', regOrder: 142, messages: 4821, photos: 237, contacts: 58, banned: false, banUntil: null, role: 'premium' as UserRole },
    { id: 2, nickname: 'mariart', tag: '#mariart', regOrder: 89, messages: 2341, photos: 891, contacts: 34, banned: false, banUntil: null, role: 'user' as UserRole },
    { id: 3, nickname: 'spammer', tag: '#spam123', regOrder: 9871, messages: 43, photos: 0, contacts: 0, banned: true, banUntil: '2026-04-01', role: 'user' as UserRole },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col animate-scale-in" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(168,85,247,0.06)' }}>
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Icon name="Shield" size={20} className="text-yellow-400" />
              Панель администратора
            </h2>
            <p className="text-white/40 text-xs mt-0.5">Lumo Admin Dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Icon name="X" size={20} className="text-white/50" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Всего пользователей', value: '12,847', icon: 'Users', color: '#a855f7' },
              { label: 'Активных сегодня', value: '3,241', icon: 'Activity', color: '#22c55e' },
              { label: 'Сообщений за день', value: '847K', icon: 'MessageSquare', color: '#0ea5e9' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <h3 className="text-white font-semibold mb-3">Пользователи</h3>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['ID', 'Тег', 'Рег.#', 'Сообщений', 'Фото', 'Контактов', 'Роль', 'Бан', 'Действия'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < mockUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                    <td className="px-4 py-3 text-white/30 text-xs">{u.id}</td>
                    <td className="px-4 py-3 lumo-tag font-semibold text-xs">{u.tag}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">#{u.regOrder}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{u.messages.toLocaleString('ru')}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{u.photos}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{u.contacts}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3">
                      {u.banned
                        ? <span className="text-red-400 text-xs font-medium">До {u.banUntil}</span>
                        : <span className="text-green-400 text-xs">Нет</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 rounded-lg text-xs text-yellow-400 font-medium" style={{ background: 'rgba(245,158,11,0.1)' }}>Premium</button>
                        <button className="px-2 py-1 rounded-lg text-xs text-red-400 font-medium" style={{ background: 'rgba(239,68,68,0.1)' }}>Бан</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────────
function MainApp({ currentUser, onUpdateUser, onLogout }: {
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AppTab>('chats');
  const [theme, setTheme] = useState('violet');
  const [showAdmin, setShowAdmin] = useState(false);

  const navItems: { id: AppTab; icon: string; label: string }[] = [
    { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
    { id: 'groups', icon: 'Users', label: 'Группы' },
    { id: 'search', icon: 'Search', label: 'Поиск' },
    { id: 'contacts', icon: 'UserCheck', label: 'Контакты' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      <div className="lumo-noise" />

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-[72px] border-r py-5 px-3 items-center gap-2 flex-shrink-0 relative z-10" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white font-display text-xl" style={{ background: 'var(--lumo-gradient)' }}>L</div>
        </div>

        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative group"
            style={{
              background: activeTab === item.id ? 'rgba(168,85,247,0.2)' : 'transparent',
              border: activeTab === item.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
            }}
          >
            <Icon name={item.icon} size={20} className={activeTab === item.id ? 'text-purple-400' : 'text-white/40'} />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10" style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>{item.label}</span>
          </button>
        ))}

        <div className="flex-1" />

        {(currentUser.role === 'admin' || currentUser.role === 'moder') && (
          <button
            onClick={() => setShowAdmin(true)}
            title="Панель администратора"
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative group mb-1"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Icon name="Shield" size={20} className="text-yellow-400" />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10" style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>Админ-панель</span>
          </button>
        )}

        <div className="relative cursor-pointer mt-1" onClick={() => setActiveTab('settings')}>
          <div className="lumo-avatar w-10 h-10 text-sm overflow-hidden">
            {currentUser.avatar
              ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
              : currentUser.nickname[0]}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && <ChatsTab currentUser={currentUser} />}
          {activeTab === 'groups' && <GroupsTab currentUser={currentUser} />}
          {activeTab === 'search' && <SearchTab />}
          {activeTab === 'contacts' && <ContactsTab />}
          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onLogout={onLogout}
              theme={theme}
              onThemeChange={setTheme}
            />
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex items-center border-t px-2 py-2 gap-1 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(20px)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all"
            >
              <Icon name={item.icon} size={20} className={activeTab === item.id ? 'text-purple-400' : 'text-white/30'} />
              <span className="text-[10px]" style={{ color: activeTab === item.id ? 'rgb(192,132,252)' : 'rgba(255,255,255,0.3)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────────
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