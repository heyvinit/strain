import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Race } from '@/lib/mockRaces';
import { colors, fonts, radii, type } from '@/lib/theme';

type Props = {
  race: Race;
  onPress?: () => void;
};

export function RaceListRow({ race, onPress }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: race.heroImage }} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <Text style={styles.sport}>{race.sport.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {race.name}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={12} color={colors.body} />
          <Text style={styles.metaText}>{race.dateShort}</Text>
          <View style={styles.dot} />
          <Ionicons name="location-outline" size={12} color={colors.body} />
          <Text style={styles.metaText} numberOfLines={1}>
            {race.city}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.priceLabel}>from</Text>
        <Text style={styles.price}>{race.priceFrom.replace('AED ', '')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.imageBg,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  sport: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: colors.body,
    letterSpacing: 1.2,
  },
  title: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    ...type.caption,
    color: colors.body,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.body,
    marginHorizontal: 4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceLabel: {
    ...type.micro,
    color: colors.body,
    letterSpacing: 1.2,
  },
  price: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
});
