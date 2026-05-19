import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Race } from '@/lib/mockRaces';
import { colors, fonts, radii, type } from '@/lib/theme';

type Props = {
  race: Race;
  width?: number;
  height?: number;
  onPress?: () => void;
};

export function RacePosterCard({ race, width = 168, height = 224, onPress }: Props) {
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
        locations={[0.4, 1]}
        style={styles.overlay}
      />
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeText}>{race.dateShort}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.sport}>{race.sport.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {race.name}
        </Text>
        <Text style={styles.city}>{race.city}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.imageBg,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  dateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dateBadgeText: {
    ...type.caption,
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  body: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 2,
  },
  sport: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  title: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  city: {
    ...type.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
