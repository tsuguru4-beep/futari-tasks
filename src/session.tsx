import { createContext, useContext } from 'react';
import type { Person } from './types';

export interface Session {
  me: Person;
  setMe(p: Person | null): void;
  signOut(): void;
}

export const SessionCtx = createContext<Session | null>(null);
export const useSession = () => useContext(SessionCtx)!;
