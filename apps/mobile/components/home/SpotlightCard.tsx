import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

type Props = {
  title: string;
  category: string;
  date: string;
  width: number;
  height: number;
};

export function SpotlightCard({ title, category, date, width, height }: Props) {
  return (
    <View style={[styles.card, { width, height }]}>
      <View style={styles.meta}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {title.toUpperCase()}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.category}>{category}</Text>
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
    justifyContent: 'flex-end',
  },
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.ink,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
    letterSpacing: -0.2,
    marginLeft: 8,
  },
  category: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.body,
    letterSpacing: -0.2,
  },
});
