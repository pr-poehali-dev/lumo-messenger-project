import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { User, Chat, Group, Message, MOCK_CHATS, MOCK_GROUPS, MOCK_MESSAGES, MOCK_CONTACTS } from '@/types';

// ─── ROLE BADGE ─────────────────────────────────────────────────────────────────
export function RoleBadge({ role }: { role: User['role'] }) {
  if (role === 'user') return null;
  const map = {
    admin: { label: 'Admin', className: 'lumo-role-admin' },
    moder: { label: 'Moder', className: 'lumo-role-moder' },
    premium: { label: 'Premium', className: 'lumo-role-premium' },
  };
  const cfg = map[role];
  return <span className={cfg.className + ' uppercase tracking-wider ml-1'}>{cfg.label}</span>;
}

// ─── CHAT WINDOW ────────────────────────────────────────────────────────────────
export function ChatWindow({ chat, currentUser, onBack }: { chat: Chat | Group; currentUser: User; onBack: () => void }) {
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
export function ChatsTab({ currentUser }: { currentUser: User }) {
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
export function GroupsTab({ currentUser }: { currentUser: User }) {
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
export function SearchTab() {
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
export function ContactsTab() {
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
