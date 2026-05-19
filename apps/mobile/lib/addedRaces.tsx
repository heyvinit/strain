import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AddedRace = {
  id: string;
  name: string;
  distance: string;
  date: string;
  city?: string;
  sourceRaceId?: string;
  createdAt: number;
};

type AddedRacesContextValue = {
  races: AddedRace[];
  hydrated: boolean;
  addRace: (input: Omit<AddedRace, 'id' | 'createdAt'>) => AddedRace;
  removeRace: (id: string) => void;
  removeBySourceId: (sourceRaceId: string) => void;
  isSourceSaved: (sourceRaceId: string) => boolean;
};

const STORAGE_KEY = 'strain.addedRaces.v1';

const AddedRacesContext = createContext<AddedRacesContextValue | null>(null);

export function AddedRacesProvider({ children }: { children: ReactNode }) {
  const [races, setRaces] = useState<AddedRace[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const skipNextPersist = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as AddedRace[];
            if (Array.isArray(parsed)) setRaces(parsed);
          } catch {
            // corrupted entry — start fresh
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(races)).catch(() => {});
  }, [races, hydrated]);

  const addRace = useCallback<AddedRacesContextValue['addRace']>((input) => {
    const race: AddedRace = {
      ...input,
      id: `ar_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setRaces((prev) => [race, ...prev]);
    return race;
  }, []);

  const removeRace = useCallback((id: string) => {
    setRaces((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const removeBySourceId = useCallback((sourceRaceId: string) => {
    setRaces((prev) => prev.filter((r) => r.sourceRaceId !== sourceRaceId));
  }, []);

  const value = useMemo<AddedRacesContextValue>(
    () => ({
      races,
      hydrated,
      addRace,
      removeRace,
      removeBySourceId,
      isSourceSaved: (sourceRaceId) =>
        races.some((r) => r.sourceRaceId === sourceRaceId),
    }),
    [races, hydrated, addRace, removeRace, removeBySourceId],
  );

  return <AddedRacesContext.Provider value={value}>{children}</AddedRacesContext.Provider>;
}

export function useAddedRaces() {
  const ctx = useContext(AddedRacesContext);
  if (!ctx) throw new Error('useAddedRaces must be used within AddedRacesProvider');
  return ctx;
}
