import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'strain.softSignup.dismissed.v1';

export function useSoftSignupState() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => setDismissed(v === '1'))
      .catch(() => setDismissed(false));
  }, []);

  const markDismissed = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(STORAGE_KEY, '1').catch(() => {});
  }, []);

  return { dismissed, markDismissed };
}
