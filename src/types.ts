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
  theme?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface Message {
  id: number;
  text: string;
  senderId: number;
  senderNickname?: string;
  senderTag?: string;
  senderAvatar?: string;
  senderRole?: string;
  timestamp: string;
  chatId: number;
  reactions?: Reaction[];
  isPinned?: boolean;
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



export function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}