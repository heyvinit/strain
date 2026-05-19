import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Race } from '@/lib/mockRaces';
import { colors, fonts, radii, type } from '@/lib/theme';

type Props = {
  race: Race;
  onPress?: () => void;
  width?: number;
  height?: number;
};

export function RaceHeroCard({ race, onPress, width = 320, height = 220 }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        { width, height, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}>
      <Image source={{ uri: race.heroImage }} style={styles.image} contentFit="cover" transition={150} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        locations={[0.45, 1]}
        style={styles.overlay}
      />
      <View style={styles.top}>
        <View style={styles.chip}>
          <View style={[styles.dot, race.hype.tone === 'urgent' && { backgroundColor: colors.warning }]} />
          <Text style={styles.chipText}>{race.hype.label}</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.sport}>{race.sport.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {race.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={colors.ink} />
            <Text style={styles.metaText}>{race.dateShort}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.ink} />
            <Text style={styles.metaText}>{race.city}</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>from {race.priceFrom}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.imageBg,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  top: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  chipText: {
    ...type.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
  },
  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    gap: 4,
  },
  sport: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.4,
  },
  title: {
    ...type.h1,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...type.caption,
    color: colors.ink,
    opacity: 0.9,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
