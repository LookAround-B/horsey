import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('horsey_access_token', accessToken);
        localStorage.setItem('horsey_refresh_token', refreshToken);
        // Cookie lets middleware do server-side route protection
        document.cookie = `horsey_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        // Clear local state first so any in-flight rehydration sees unauthenticated state
        const token = localStorage.getItem('horsey_access_token');
        localStorage.removeItem('horsey_access_token');
        localStorage.removeItem('horsey_refresh_token');
        document.cookie = 'horsey_role=; path=/; max-age=0';
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        // Fire-and-forget server logout — use raw fetch to avoid the 401 interceptor loop
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'horsey-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
