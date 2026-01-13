import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  has_gmail_scope: boolean;
  has_sheets_scope: boolean;
  has_outlook: boolean;
  is_admin: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'ea_auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
