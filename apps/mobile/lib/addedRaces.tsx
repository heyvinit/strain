import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type AddedRace = {
  id: string;
  name: string;
  distance: string;
  date: string;
  city?: string;
  createdAt: number;
};

type AddedRacesContextValue = {
  races: AddedRace[];
  addRace: (input: Omit<AddedRace, 'id' | 'createdAt'>) => AddedRace;
  removeRace: (id: string) => void;
};

const AddedRacesContext = createContext<AddedRacesContextValue | null>(null);

export function AddedRacesProvider({ children }: { children: ReactNode }) {
  const [races, setRaces] = useState<AddedRace[]>([]);

  const value = useMemo<AddedRacesContextValue>(
    () => ({
      races,
      addRace: (input) => {
        const race: AddedRace = {
          ...input,
          id: `ar_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          createdAt: Date.now(),
        };
        setRaces((prev) => [race, ...prev]);
        return race;
      },
      removeRace: (id) => setRaces((prev) => prev.filter((r) => r.id !== id)),
    }),
    [races],
  );

  return <AddedRacesContext.Provider value={value}>{children}</AddedRacesContext.Provider>;
}

export function useAddedRaces() {
  const ctx = useContext(AddedRacesContext);
  if (!ctx) throw new Error('useAddedRaces must be used within AddedRacesProvider');
  return ctx;
}
