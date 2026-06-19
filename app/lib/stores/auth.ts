import { atom } from 'nanostores';
import type { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const authStore = atom<AuthState>({
  user: null,
  loading: true,
  error: null,
});

export const setAuthUser = (user: User | null) => {
  authStore.set({ user, loading: false, error: null });
};

export const setAuthError = (error: string) => {
  authStore.set({ ...authStore.get(), loading: false, error });
};

export const setAuthLoading = () => {
  authStore.set({ ...authStore.get(), loading: true, error: null });
};
