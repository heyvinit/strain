import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/home/LocationHeader';
import { ModeToggle, type HomeMode } from '@/components/home/ModeToggle';
import { SpotlightCard } from '@/components/home/SpotlightCard';
import { StreetMapPreview } from '@/components/home/StreetMapPreview';
import { colors, layout } from '@/lib/theme';

const NIGHT_RACES = [
  { id: '1', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27' },
  { id: '2', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27' },
  { id: '3', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27' },
  { id: '4', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27' },
];

export default function MapScreen() {
  const [mode, setMode] = useState<HomeMode>('races');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <LocationHeader />
        <View style={styles.toggleWrap}>
          <ModeToggle value={mode} onChange={setMode} />
        </View>
      </View>

      <View style={styles.mapWrap}>
        <StreetMapPreview height={580} />
        <View style={styles.cardsOverlay}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}>
            {NIGHT_RACES.map((race) => (
              <SpotlightCard
                key={race.id}
                title={race.title}
                category={race.category}
                date={race.date}
                width={159}
                height={120}
              />
            ))}
          </ScrollView>
        </View>
      </View>
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
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  cardsOverlay: {
    position: 'absolute',
    bottom: layout.bottomNavClearance + 20,
    left: 0,
    right: 0,
  },
  cardsRow: {
    paddingHorizontal: layout.screenPadding,
    gap: 14,
  },
});
