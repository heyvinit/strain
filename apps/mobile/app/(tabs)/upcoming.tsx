import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationHeader } from '@/components/home/LocationHeader';
import { ModeToggle, type HomeMode } from '@/components/home/ModeToggle';
import { useAddedRaces, type AddedRace } from '@/lib/addedRaces';
import { colors, fonts, layout, radii, type } from '@/lib/theme';

export default function UpcomingScreen() {
  const [mode, setMode] = useState<HomeMode>('races');
  const { races, removeRace } = useAddedRaces();

  const openAdd = () => {
    Haptics.selectionAsync().catch(() => {});
    router.push('/add-race');
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
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Upcoming</Text>
          <Pressable hitSlop={10} onPress={openAdd} style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.bg} />
            <Text style={styles.addBtnLabel}>Add a race</Text>
          </Pressable>
        </View>

        {races.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <View style={styles.list}>
            {races.map((race) => (
              <UpcomingRow key={race.id} race={race} onRemove={() => removeRace(race.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="calendar-outline" size={28} color={colors.body} />
      </View>
      <Text style={styles.emptyTitle}>No races yet</Text>
      <Text style={styles.emptyBody}>
        Add a race and Strain will pull the expo info, weather, bib release, and results.
      </Text>
      <Pressable onPress={onAdd} style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.9 }]}>
        <Ionicons name="add" size={18} color={colors.bg} />
        <Text style={styles.emptyCtaLabel}>Add your first race</Text>
      </Pressable>
    </View>
  );
}

function UpcomingRow({ race, onRemove }: { race: AddedRace; onRemove: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowDist}>{race.distance.toUpperCase()}</Text>
        <Text style={styles.rowName} numberOfLines={1}>
          {race.name}
        </Text>
        <View style={styles.rowMeta}>
          <Ionicons name="calendar-outline" size={12} color={colors.body} />
          <Text style={styles.rowMetaText}>{race.date}</Text>
          {race.city && (
            <>
              <View style={styles.rowDot} />
              <Ionicons name="location-outline" size={12} color={colors.body} />
              <Text style={styles.rowMetaText}>{race.city}</Text>
            </>
          )}
        </View>
      </View>
      <Pressable
        hitSlop={10}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onRemove();
        }}
        style={styles.rowAction}>
        <Ionicons name="close" size={18} color={colors.body} />
      </Pressable>
    </View>
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
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    paddingBottom: layout.bottomNavClearance + 24,
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...type.h1,
    color: colors.ink,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  addBtnLabel: {
    ...type.label,
    color: colors.bg,
    fontFamily: fonts.bodyBold,
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 48,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.ink,
  },
  emptyBody: {
    ...type.bodySmall,
    color: colors.body,
    textAlign: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.pill,
    marginTop: 12,
  },
  emptyCtaLabel: {
    ...type.label,
    color: colors.bg,
    fontFamily: fonts.bodyBold,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowDist: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: colors.body,
    letterSpacing: 1.2,
  },
  rowName: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  rowMetaText: {
    ...type.caption,
    color: colors.body,
  },
  rowDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.body,
    marginHorizontal: 4,
  },
  rowAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
