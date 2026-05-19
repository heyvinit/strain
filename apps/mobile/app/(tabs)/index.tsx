import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/home/LocationHeader';
import { ModeToggle, type HomeMode } from '@/components/home/ModeToggle';
import { RacesView } from '@/components/home/RacesView';
import { RunClubsView } from '@/components/home/RunClubsView';
import { SoftSignupSheet } from '@/components/SoftSignupSheet';
import { useSoftSignupState } from '@/lib/softSignup';
import { colors, layout } from '@/lib/theme';

const SIGNUP_SCROLL_TRIGGER_PX = 900;

export default function HomeScreen() {
  const [mode, setMode] = useState<HomeMode>('races');
  const sheetRef = useRef<BottomSheetModal>(null);
  const { dismissed, markDismissed } = useSoftSignupState();
  const triggered = useRef(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (triggered.current) return;
    if (dismissed !== false) return;
    if (e.nativeEvent.contentOffset.y > SIGNUP_SCROLL_TRIGGER_PX) {
      triggered.current = true;
      sheetRef.current?.present();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <LocationHeader />
        <View style={styles.toggleWrap}>
          <ModeToggle value={mode} onChange={setMode} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={64}>
        {mode === 'races' ? <RacesView /> : <RunClubsView />}
      </ScrollView>

      <SoftSignupSheet ref={sheetRef} onDismiss={markDismissed} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.bg,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  toggleWrap: {
    paddingTop: 1,
  },
  scroll: {
    paddingBottom: layout.bottomNavClearance + 24,
  },
});
