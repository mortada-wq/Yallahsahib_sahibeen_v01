import { useStore } from '@nanostores/react';
import { useUser, useClerk } from '@clerk/remix';
import { useEffect } from 'react';
import { authStore, setAuthUser, type ClerkUser } from '~/lib/stores/auth';

export function useAuthListener() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const clerkUser: ClerkUser = {
        id: user.id,
        emailAddresses: user.emailAddresses.map((e) => ({ emailAddress: e.emailAddress })),
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        fullName: user.fullName,
      };
      setAuthUser(clerkUser);
    } else {
      setAuthUser(null);
    }
  }, [user, isLoaded]);
}

export function useAuth() {
  return useStore(authStore);
}

export function useClerkSignOut() {
  const { signOut } = useClerk();
  return signOut;
}
