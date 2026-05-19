import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

type Props = {
  title: string;
  date: string;
  city: string;
  distance: string;
  category: string;
  width?: number;
};

export function RaceFeatureCard({
  title,
  date,
  city,
  distance,
  category,
  width = 300,
}: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.hero} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title.toUpperCase()}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={10} color={colors.body} />
          <Text style={styles.metaText}>{city}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="trail-sign-outline" size={10} color={colors.body} />
          <Text style={styles.metaText}>{distance}</Text>
        </View>
        <Text style={styles.category}>{category.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 13,
    gap: 8,
  },
  hero: {
    height: 220,
    borderRadius: radii.md,
    backgroundColor: colors.empty,
  },
  body: {
    paddingHorizontal: 7,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.6,
    color: colors.ink,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: -0.2,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.body,
    letterSpacing: -0.2,
  },
  category: {
    fontFamily: fonts.titleMedium,
    fontSize: 10,
    color: colors.body,
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
