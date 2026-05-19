import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/home/LocationHeader';
import { ModeToggle, type HomeMode } from '@/components/home/ModeToggle';
import { RacesView } from '@/components/home/RacesView';
import { RunClubsView } from '@/components/home/RunClubsView';
import { colors, layout } from '@/lib/theme';

export default function HomeScreen() {
  const [mode, setMode] = useState<HomeMode>('races');

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
        showsVerticalScrollIndicator={false}>
        {mode === 'races' ? <RacesView /> : <RunClubsView />}
      </ScrollView>
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
