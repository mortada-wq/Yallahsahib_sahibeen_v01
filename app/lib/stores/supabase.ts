// Supabase integration has been removed.
import { atom } from 'nanostores';

export const supabaseConnection = atom<{ isConnected: boolean }>({ isConnected: false });
