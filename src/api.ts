const URLS = {
  auth: 'https://functions.poehali.dev/7364983a-ac5c-4462-bce1-ecf9120892e9',
  chats: 'https://functions.poehali.dev/e3d5a990-7eb7-4313-95a0-6ea45c0c8386',
  contacts: 'https://functions.poehali.dev/4c444e12-8cdd-4ceb-b7f3-5e423b810673',
  messages: 'https://functions.poehali.dev/1c65777a-dcdb-4944-b239-1d121877c890',
};

function getSession(): string {
  return localStorage.getItem('lumo_session') || '';
}

async function req(base: keyof typeof URLS, path: string, options: RequestInit = {}) {
  const sid = getSession();
  const res = await fetch(URLS[base] + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sid,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

export const api = {
  auth: {
    register: (nickname: string, tag: string, password: string) =>
      req('auth', '/register', { method: 'POST', body: JSON.stringify({ nickname, tag, password }) }),
    login: (tag: string, password: string) =>
      req('auth', '/login', { method: 'POST', body: JSON.stringify({ tag, password }) }),
    me: () => req('auth', '/me', { method: 'GET' }),
    updateProfile: (data: Record<string, string>) =>
      req('auth', '/profile', { method: 'PUT', body: JSON.stringify(data) }),
    logout: () => req('auth', '/logout', { method: 'POST' }),
  },
  chats: {
    list: () => req('chats', '/list', { method: 'GET' }),
    groups: () => req('chats', '/groups', { method: 'GET' }),
    createGroup: (name: string, tag: string, description?: string) =>
      req('chats', '/create-group', { method: 'POST', body: JSON.stringify({ name, tag, description }) }),
    openDm: (tag: string) =>
      req('chats', '/open-dm', { method: 'POST', body: JSON.stringify({ tag }) }),
    search: (q: string) => req('chats', `/search?q=${encodeURIComponent(q)}`, { method: 'GET' }),
  },
  messages: {
    list: (chatId: number) => req('messages', `/list?chat_id=${chatId}`, { method: 'GET' }),
    send: (chatId: number, text: string) =>
      req('messages', '/send', { method: 'POST', body: JSON.stringify({ chat_id: chatId, text }) }),
    react: (messageId: number, emoji: string) =>
      req('messages', '/react', { method: 'POST', body: JSON.stringify({ message_id: messageId, emoji }) }),
  },
  contacts: {
    list: () => req('contacts', '/list', { method: 'GET' }),
    add: (tag: string) =>
      req('contacts', '/add', { method: 'POST', body: JSON.stringify({ tag }) }),
  },
};
