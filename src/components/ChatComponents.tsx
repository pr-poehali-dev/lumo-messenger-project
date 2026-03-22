import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { User, Chat, Group, Message, Reaction } from '@/types';
import { api } from '@/api';

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

// ─── EMOJI PICKER ───────────────────────────────────────────────────────────────
const QUICK_EMOJIS = ['😂', '❤️', '👍', '🔥', '😮', '😢', '👏', '🎉', '💀', '🤣', '✨', '😍'];
const ALL_EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘',
  '😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥',
  '😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔',
  '😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨',
  '😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😷','🤒','🤕','🤢',
  '🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💞','💓','💗','💖',
  '💘','💝','💟','🔥','⭐','🌟','💫','✨','🎉','🎊','🎈','🎁',
  '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚',
  '🖐️','🖖','👋','💪','🦾','🙌','👐','🤲','🤝','🙏','✍️','💅',
];

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-full mb-2 left-0 rounded-2xl p-3 z-50 animate-scale-in"
      style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', width: 280, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
        {ALL_EMOJIS.map(e => (
          <button key={e} onClick={() => { onSelect(e); onClose(); }}
            className="text-xl p-1 rounded-lg hover:bg-white/10 transition-colors leading-none">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── REACTION BAR ───────────────────────────────────────────────────────────────
function ReactionBar({ reactions, onReact }: { reactions: Reaction[]; onReact: (emoji: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const validReactions = (reactions || []).filter(r => !r.emoji.endsWith('_off'));

  if (validReactions.length === 0) return (
    <div className="relative">
      <button onClick={() => setShowPicker(v => !v)}
        className="text-sm px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-all"
        style={{ background: 'rgba(255,255,255,0.08)' }}>😊</button>
      {showPicker && (
        <div className="absolute bottom-full mb-1 z-50 animate-scale-in" style={{ right: 0 }}>
          <div className="flex gap-1 p-2 rounded-xl flex-wrap max-w-xs"
            style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            {QUICK_EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(e); setShowPicker(false); }}
                className="text-lg hover:scale-125 transition-transform">{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-1 mt-1 items-center relative">
      {validReactions.map(r => (
        <button key={r.emoji} onClick={() => onReact(r.emoji)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
          style={{
            background: r.mine ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.07)',
            border: r.mine ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)'
          }}>
          <span>{r.emoji}</span>
          <span className="text-white/70 font-medium">{r.count}</span>
        </button>
      ))}
      <button onClick={() => setShowPicker(v => !v)}
        className="text-xs px-1.5 py-0.5 rounded-full opacity-50 hover:opacity-100 transition-all"
        style={{ background: 'rgba(255,255,255,0.07)' }}>+</button>
      {showPicker && (
        <div className="absolute bottom-full mb-1 z-50 animate-scale-in" style={{ left: 0 }}>
          <div className="flex gap-1 p-2 rounded-xl"
            style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            {QUICK_EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(e); setShowPicker(false); }}
                className="text-lg hover:scale-125 transition-transform">{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAT WINDOW ────────────────────────────────────────────────────────────────
export function ChatWindow({ chat, currentUser, onBack }: { chat: Chat | Group; currentUser: User; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    api.messages.list(chat.id).then(res => {
      if (res.ok && Array.isArray(res.data)) {
        setMessages(res.data.map((m: Message) => ({ ...m, chatId: chat.id })));
        const pinned = res.data.find((m: Message) => m.isPinned);
        if (pinned) setPinnedMsg(pinned.text || null);
      }
      setLoading(false);
    });
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    const res = await api.messages.send(chat.id, text);
    if (res.ok) setMessages(prev => [...prev, { ...res.data, chatId: chat.id }]);
  };

  const handleReact = async (messageId: number, emoji: string) => {
    const res = await api.messages.react(messageId, emoji);
    if (res.ok) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: res.data.reactions } : m));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-white/60" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="lumo-avatar w-10 h-10 text-sm font-bold">{chat.name[0]}</div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white font-semibold truncate block">{chat.name}</span>
          <span className="text-xs" style={{ color: 'rgba(168,85,247,0.8)' }}>{chat.tag}</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Icon name="MoreVertical" size={18} className="text-white/40" />
        </button>
      </div>

      {pinnedMsg && (
        <div className="flex items-center gap-3 px-5 py-2 text-xs flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.07)', borderBottom: '1px solid rgba(168,85,247,0.12)' }}>
          <Icon name="Pin" size={12} className="text-purple-400 flex-shrink-0" />
          <span className="text-white/60 truncate">{pinnedMsg}</span>
          <button onClick={() => setPinnedMsg(null)} className="ml-auto text-white/30 hover:text-white/60">
            <Icon name="X" size={12} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-white/30 text-sm">Начните общение! Сообщения хранятся 3 дня.</p>
          </div>
        ) : messages.map(msg => {
          const isMine = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
              <div className={`${isMine ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
                {!isMine && msg.senderNickname && (
                  <span className="text-xs text-white/40 mb-1 px-1">{msg.senderNickname}</span>
                )}
                <div className={`lumo-message-bubble ${isMine ? 'mine' : 'other'}`}>{msg.text}</div>
                <ReactionBar reactions={msg.reactions || []} onReact={(emoji) => handleReact(msg.id, emoji)} />
                <p className={`text-xs mt-1 text-white/30 ${isMine ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 relative">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={18} className="text-white/40" />
          </button>
          <div className="relative flex-shrink-0">
            <button onClick={() => setShowEmoji(v => !v)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-lg leading-none">
              😊
            </button>
            {showEmoji && <EmojiPicker onSelect={e => setInput(prev => prev + e)} onClose={() => setShowEmoji(false)} />}
          </div>
          <input className="lumo-input flex-1 rounded-xl py-3 px-4 text-sm"
            placeholder="Напиши сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.chats.list().then(res => {
      if (res.ok && Array.isArray(res.data)) {
        setChats(res.data.map((c: Chat) => ({ ...c, unread: 0, online: false })));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex h-full">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-col border-r flex-shrink-0`}
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-white font-bold text-lg mb-3">Сообщения</h2>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="lumo-input w-full rounded-xl py-2.5 pl-9 pr-4 text-sm" placeholder="Поиск чатов..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-white/30 text-sm">Нет чатов. Найди кого-нибудь через Поиск!</p>
            </div>
          ) : chats.map(chat => (
            <div key={chat.id} onClick={() => setSelectedChat(chat)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: selectedChat?.id === chat.id ? 'rgba(168,85,247,0.12)' : undefined }}
              onMouseEnter={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (selectedChat?.id !== chat.id) (e.currentTarget as HTMLDivElement).style.background = ''; }}>
              <div className="lumo-avatar w-11 h-11 text-base flex-shrink-0">{chat.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm truncate">{chat.name}</span>
                  <span className="text-white/30 text-xs flex-shrink-0 ml-2">{chat.time}</span>
                </div>
                <span className="text-white/40 text-xs truncate block">{chat.lastMessage || 'Нет сообщений'}</span>
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
            <div className="w-20 h-20 rounded-2xl mb-5 flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTag, setNewGroupTag] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.chats.groups().then(res => {
      if (res.ok && Array.isArray(res.data)) setGroups(res.data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newGroupName || !newGroupTag) return;
    setCreating(true);
    const res = await api.chats.createGroup(newGroupName, newGroupTag);
    if (res.ok) {
      setGroups(prev => [...prev, { id: res.data.id, name: res.data.name, tag: res.data.tag, members: 1, lastMessage: '', time: '' }]);
      setShowCreate(false); setNewGroupName(''); setNewGroupTag('');
    }
    setCreating(false);
  };

  return (
    <div className="flex h-full">
      <div className={`${selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-col border-r flex-shrink-0`}
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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
          <div className="mx-4 mb-3 p-4 rounded-xl animate-scale-in"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h3 className="text-white font-semibold text-sm mb-3">Новая группа</h3>
            <input className="lumo-input w-full rounded-xl py-2.5 px-4 text-sm mb-2"
              placeholder="Название группы" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-sm">#</span>
              <input className="lumo-input w-full rounded-xl py-2.5 pl-8 pr-4 text-sm"
                placeholder="тег_группы" value={newGroupTag}
                onChange={e => setNewGroupTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl py-2 text-sm text-white/50"
                style={{ background: 'rgba(255,255,255,0.05)' }}>Отмена</button>
              <button onClick={handleCreate} disabled={creating} className="lumo-btn-primary flex-1 rounded-xl py-2 text-sm font-semibold">
                {creating ? '...' : 'Создать'}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-white/30 text-sm">Ты не состоишь ни в одной группе. Создай свою!</p>
            </div>
          ) : groups.map(group => (
            <div key={group.id} onClick={() => setSelectedGroup(group)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: selectedGroup?.id === group.id ? 'rgba(168,85,247,0.12)' : undefined }}
              onMouseEnter={e => { if (selectedGroup?.id !== group.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (selectedGroup?.id !== group.id) (e.currentTarget as HTMLDivElement).style.background = ''; }}>
              <div className="lumo-avatar w-11 h-11 text-lg flex-shrink-0">{group.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm truncate">{group.name}</span>
                  <span className="text-white/30 text-xs flex-shrink-0 ml-2">{group.time}</span>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-white/40 text-xs truncate">{group.lastMessage || 'Нет сообщений'}</span>
                  <span className="text-white/25 text-xs flex-shrink-0 ml-2">{group.members?.toLocaleString('ru')}</span>
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
            <div className="w-20 h-20 rounded-2xl mb-5 flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
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
export function SearchTab({ currentUser }: { currentUser: User }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingTag, setAddingTag] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true); setSearched(true);
    const res = await api.chats.search(query);
    if (res.ok && Array.isArray(res.data)) setResults(res.data.filter((u: User) => u.id !== currentUser.id));
    setLoading(false);
  };

  const handleMessage = async (tag: string) => {
    await api.chats.openDm(tag);
    alert('Чат открыт! Перейди во вкладку "Чаты"');
  };

  const handleAddContact = async (tag: string) => {
    setAddingTag(tag);
    await api.contacts.add(tag);
    setAddingTag(null);
  };

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-y-auto">
      <h2 className="text-white font-bold text-lg mb-4">Поиск по тегу</h2>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">#</span>
          <input className="lumo-input w-full rounded-xl py-3 pl-8 pr-4 text-sm"
            placeholder="тег_пользователя"
            value={query.replace('#', '')}
            onChange={e => setQuery('#' + e.target.value.replace('#', ''))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
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
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center flex-1">
          <span className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
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
              <div className="flex gap-1">
                <button onClick={() => handleMessage(user.tag)} className="lumo-btn-primary rounded-xl p-2.5 flex-shrink-0" title="Написать">
                  <Icon name="MessageCircle" size={16} />
                </button>
                <button onClick={() => handleAddContact(user.tag)} disabled={addingTag === user.tag}
                  className="rounded-xl p-2.5 flex-shrink-0 hover:bg-white/5 transition-colors" title="В контакты">
                  <Icon name="UserPlus" size={16} className="text-purple-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CONTACTS TAB ───────────────────────────────────────────────────────────────
export function ContactsTab({ currentUser }: { currentUser: User }) {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addTag, setAddTag] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    api.contacts.list().then(res => {
      if (res.ok && Array.isArray(res.data)) setContacts(res.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!addTag) return;
    setAdding(true); setAddError('');
    const res = await api.contacts.add(addTag);
    if (res.ok) {
      setContacts(prev => [...prev, res.data]);
      setAddTag(''); setShowAdd(false);
    } else {
      setAddError(res.data?.error || 'Ошибка');
    }
    setAdding(false);
  };

  const handleMessage = async (tag: string) => {
    await api.chats.openDm(tag);
    alert('Чат открыт! Перейди во вкладку "Чаты"');
  };

  return (
    <div className="flex flex-col h-full px-5 py-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Контакты</h2>
        <button onClick={() => setShowAdd(v => !v)} className="lumo-btn-primary rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
          <Icon name="UserPlus" size={14} />Добавить
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 rounded-xl animate-scale-in"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-white/60 text-xs mb-2">Введи #тег пользователя</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold">#</span>
              <input className="lumo-input w-full rounded-xl py-2.5 pl-7 pr-4 text-sm"
                placeholder="тег_пользователя"
                value={addTag.replace('#', '')}
                onChange={e => { setAddTag('#' + e.target.value.replace('#', '')); setAddError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <button onClick={handleAdd} disabled={adding} className="lumo-btn-primary rounded-xl px-4 text-sm font-semibold">
              {adding ? '...' : 'OK'}
            </button>
          </div>
          {addError && <p className="text-red-400 text-xs mt-2">{addError}</p>}
        </div>
      )}

      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="lumo-input w-full rounded-xl py-2.5 pl-9 pr-4 text-sm" placeholder="Поиск контактов..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <span className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-white/30 text-sm">Нет контактов. Найди кого-нибудь в Поиске!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(contact => (
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
                <button onClick={() => handleMessage(contact.tag)} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Написать">
                  <Icon name="MessageCircle" size={18} className="text-purple-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
