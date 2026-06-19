import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '~/lib/firebase';
import { setAuthUser } from '~/lib/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
