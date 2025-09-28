import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as AuthApi from '@api/auth';

type AuthState = {
  user: AuthApi.AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  hydrate: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      set({ token });
      try {
        const user = await AuthApi.getMe();
        set({ user });
      } catch (e) {
        // invalid token
        await AsyncStorage.removeItem('auth_token');
        set({ token: null, user: null });
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await AuthApi.login({ email, password });
      await AsyncStorage.setItem('auth_token', token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || 'Đăng nhập thất bại', loading: false });
      throw e;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await AuthApi.register({ name, email, password, password_confirmation: password });
      await AsyncStorage.setItem('auth_token', token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || 'Đăng ký thất bại', loading: false });
      throw e;
    }
  },

  fetchMe: async () => {
    const user = await AuthApi.getMe();
    set({ user });
  },

  logout: async () => {
    try {
      await AuthApi.logout();
    } finally {
      await AsyncStorage.removeItem('auth_token');
      set({ token: null, user: null });
    }
  },
}));


