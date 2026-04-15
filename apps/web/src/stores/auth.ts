import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('horsey_access_token', accessToken);
        localStorage.setItem('horsey_refresh_token', refreshToken);
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          await apiClient.post(ENDPOINTS.LOGOUT);
        } catch {
          // Ignore logout errors
        }
        localStorage.removeItem('horsey_access_token');
        localStorage.removeItem('horsey_refresh_token');
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'horsey-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
