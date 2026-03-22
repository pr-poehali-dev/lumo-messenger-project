export type Screen = 'auth' | 'register' | 'app';
export type AppTab = 'chats' | 'groups' | 'search' | 'contacts' | 'settings';
export type SettingsTab = 'profile' | 'themes' | 'premium';
export type UserRole = 'admin' | 'moder' | 'premium' | 'user';

export interface User {
  id: number;
  nickname: string;
  tag: string;
  role: UserRole;
  avatar?: string;
  description?: string;
  banned?: boolean;
}

export interface Message {
  id: number;
  text: string;
  senderId: number;
  timestamp: string;
  chatId: number;
}

export interface Chat {
  id: number;
  name: string;
  tag: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

export interface Group {
  id: number;
  name: string;
  tag: string;
  members: number;
  lastMessage: string;
  time: string;
  avatar?: string;
  description?: string;
}

export const THEMES = [
  { id: 'violet', name: 'Lumo Classic', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', preview: ['#7c3aed', '#a855f7', '#ec4899'] },
  { id: 'ocean', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6)', preview: ['#0ea5e9', '#6366f1', '#8b5cf6'] },
  { id: 'fire', name: 'Solar Flare', gradient: 'linear-gradient(135deg, #f97316, #ef4444, #ec4899)', preview: ['#f97316', '#ef4444', '#ec4899'] },
  { id: 'forest', name: 'Neon Forest', gradient: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)', preview: ['#10b981', '#06b6d4', '#6366f1'] },
  { id: 'gold', name: 'Golden Hour', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)', preview: ['#f59e0b', '#ef4444', '#ec4899'] },
  { id: 'midnight', name: 'Midnight Rose', gradient: 'linear-gradient(135deg, #be185d, #7c3aed, #1d4ed8)', preview: ['#be185d', '#7c3aed', '#1d4ed8'] },
];

export const MOCK_CHATS: Chat[] = [
  { id: 1, name: 'Алекс', tag: '#alexdev', lastMessage: 'Привет! Как дела?', time: '14:32', unread: 3, online: true },
  { id: 2, name: 'Мария', tag: '#mariart', lastMessage: 'Отправила тебе файл', time: '13:15', unread: 0, online: true },
  { id: 3, name: 'Дмитрий', tag: '#dmitry99', lastMessage: 'Ок, увидимся завтра', time: '11:44', unread: 1, online: false },
  { id: 4, name: 'Катя', tag: '#katya_k', lastMessage: '😂😂😂', time: 'вчера', unread: 0, online: false },
  { id: 5, name: 'Никита', tag: '#nik_tech', lastMessage: 'Посмотри это видео', time: 'вчера', unread: 7, online: true },
];

export const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Dev Community', tag: '#devcom', members: 1284, lastMessage: 'alexdev: Новый релиз React 20!', time: '15:01', description: 'Сообщество разработчиков' },
  { id: 2, name: 'Дизайн & UI', tag: '#design_ui', members: 892, lastMessage: 'mariart: Крутые референсы', time: '14:22', description: 'Про дизайн и интерфейсы' },
  { id: 3, name: 'Lumo Official', tag: '#lumo_hq', members: 45672, lastMessage: 'Добро пожаловать в Lumo!', time: '09:00', description: 'Официальный канал Lumo' },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 1, text: 'Привет! Как дела?', senderId: 2, timestamp: '14:30', chatId: 1 },
  { id: 2, text: 'Отлично! Работаю над новым проектом', senderId: 1, timestamp: '14:31', chatId: 1 },
  { id: 3, text: 'Звучит интересно! Что за проект?', senderId: 2, timestamp: '14:31', chatId: 1 },
  { id: 4, text: 'Мессенджер с тегами вместо номеров 😄', senderId: 1, timestamp: '14:32', chatId: 1 },
  { id: 5, text: 'О, это Lumo! Крутая идея 🚀', senderId: 2, timestamp: '14:32', chatId: 1 },
];

export const MOCK_CONTACTS: User[] = [
  { id: 2, nickname: 'Алекс', tag: '#alexdev', role: 'premium', description: 'Full-stack разработчик' },
  { id: 3, nickname: 'Мария', tag: '#mariart', role: 'user', description: 'UI/UX дизайнер' },
  { id: 4, nickname: 'Дмитрий', tag: '#dmitry99', role: 'moder', description: 'Модератор' },
];

export function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
