import { atom } from 'nanostores';

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  fullName: string | null;
}

export interface AuthState {
  user: ClerkUser | null;
  loading: boolean;
  error: string | null;
}

export const authStore = atom<AuthState>({
  user: null,
  loading: true,
  error: null,
});

export const setAuthUser = (user: ClerkUser | null) => {
  authStore.set({ user, loading: false, error: null });
};

export const setAuthError = (error: string) => {
  authStore.set({ ...authStore.get(), loading: false, error });
};

export const setAuthLoading = () => {
  authStore.set({ ...authStore.get(), loading: true, error: null });
};
