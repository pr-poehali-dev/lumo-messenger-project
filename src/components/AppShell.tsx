import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { User, AppTab, SettingsTab, UserRole, THEMES } from '@/types';
import { RoleBadge, ChatsTab, GroupsTab, SearchTab, ContactsTab } from '@/components/ChatComponents';
import { api } from '@/api';

// Применить тему через CSS-переменные
function applyTheme(themeId: string) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  const [c1, c2, c3] = theme.preview;
  const root = document.documentElement;
  root.style.setProperty('--lumo-gradient', `linear-gradient(135deg, ${c1} 0%, ${c2} 40%, ${c3} 100%)`);
  root.style.setProperty('--lumo-gradient-soft', `linear-gradient(135deg, ${c1}26 0%, ${c2}1a 50%, ${c3}26 100%)`);
  root.style.setProperty('--lumo-glow', `0 0 30px ${c2}4d`);
  root.style.setProperty('--lumo-glow-strong', `0 0 60px ${c2}80`);
  // primary color
  const hex = c2.replace('#', '');
  const r = parseInt(hex.slice(0,2), 16);
  const g = parseInt(hex.slice(2,4), 16);
  const b = parseInt(hex.slice(4,6), 16);
  const h = Math.round(Math.atan2(1.732 * (g - b), 2 * r - g - b) * 180 / Math.PI + 360) % 360;
  root.style.setProperty('--primary', `${h} 70% 60%`);
  root.style.setProperty('--ring', `${h} 70% 60%`);
}

// ─── SETTINGS TAB ───────────────────────────────────────────────────────────────
export function SettingsTab({ currentUser, onUpdateUser, onLogout, theme, onThemeChange }: {
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

  const handleSave = async () => {
    const res = await api.auth.updateProfile({ nickname, description });
    if (res.ok) onUpdateUser(res.data);
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
export function AdminPanel({ onClose }: { onClose: () => void }) {
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
export function MainApp({ currentUser, onUpdateUser, onLogout }: {
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AppTab>('chats');
  const [theme, setTheme] = useState(currentUser.theme || 'violet');
  const [showAdmin, setShowAdmin] = useState(false);

  // Применяем тему при монтировании
  useEffect(() => { applyTheme(currentUser.theme || 'violet'); }, []);

  const handleThemeChange = async (id: string) => {
    setTheme(id);
    applyTheme(id);
    await api.auth.updateProfile({ theme: id });
    onUpdateUser({ ...currentUser, theme: id });
  };

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
          {activeTab === 'search' && <SearchTab currentUser={currentUser} />}
          {activeTab === 'contacts' && <ContactsTab currentUser={currentUser} />}
          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onLogout={onLogout}
              theme={theme}
              onThemeChange={handleThemeChange}
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