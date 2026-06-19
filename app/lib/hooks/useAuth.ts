import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber,
  type RecaptchaVerifier,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '~/lib/firebase';
import { authStore, setAuthUser, setAuthError, setAuthLoading } from '~/lib/stores/auth';

export function useAuthListener() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return unsubscribe;
  }, []);
}

export function useAuth() {
  return useStore(authStore);
}

export async function signInEmail(email: string, password: string) {
  setAuthLoading();

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    setAuthError(e.message);
    throw e;
  }
}

export async function signUpEmail(email: string, password: string, displayName?: string) {
  setAuthLoading();

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(user, { displayName });
    }
  } catch (e: any) {
    setAuthError(e.message);
    throw e;
  }
}

export async function signInGoogle() {
  setAuthLoading();

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e: any) {
    setAuthError(e.message);
    throw e;
  }
}

export async function signInGithub() {
  setAuthLoading();

  try {
    await signInWithPopup(auth, githubProvider);
  } catch (e: any) {
    setAuthError(e.message);
    throw e;
  }
}

export async function sendPhoneOtp(phone: string, recaptchaVerifier: RecaptchaVerifier) {
  setAuthLoading();

  try {
    const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    authStore.set({ ...authStore.get(), loading: false, error: null });

    return result;
  } catch (e: any) {
    setAuthError(e.message);
    throw e;
  }
}

export async function signOutUser() {
  await signOut(auth);
}
