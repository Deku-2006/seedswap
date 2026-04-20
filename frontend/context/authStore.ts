'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface User {
  _id: string;
  name: string;
  email: string;
  location: string;
  avatar: string | null;
  bio: string;
  language: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, location?: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem('seedswap_token');
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, token, initialized: true });
      connectSocket(token);
    } catch {
      localStorage.removeItem('seedswap_token');
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('seedswap_token', token);
    set({ user, token, loading: false });
    connectSocket(token);
  },

  register: async (name, email, password, location) => {
    set({ loading: true });
    const res = await api.post('/auth/register', { name, email, password, location });
    const { token, user } = res.data;
    localStorage.setItem('seedswap_token', token);
    set({ user, token, loading: false });
    connectSocket(token);
  },

  logout: () => {
    localStorage.removeItem('seedswap_token');
    disconnectSocket();
    set({ user: null, token: null });
  },

  updateUser: (updates) => {
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }));
  },
}));
