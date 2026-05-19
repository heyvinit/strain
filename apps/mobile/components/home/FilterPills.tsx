import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

export type Pill =
  | { kind: 'sort'; label: string }
  | { kind: 'dropdown'; label: string }
  | { kind: 'plain'; label: string }
  | { kind: 'selected'; label: string };

const DEFAULT_PILLS: Pill[] = [
  { kind: 'sort', label: 'Sort' },
  { kind: 'dropdown', label: 'Distance' },
  { kind: 'dropdown', label: 'Category' },
  { kind: 'plain', label: 'Top Rated' },
  { kind: 'plain', label: 'Best exp.' },
  { kind: 'selected', label: 'Lorem Ipsum' },
];

type Props = {
  pills?: Pill[];
};

export function FilterPills({ pills = DEFAULT_PILLS }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {pills.map((pill) => (
        <PillView key={pill.label} pill={pill} />
      ))}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}

function PillView({ pill }: { pill: Pill }) {
  if (pill.kind === 'selected') {
    return (
      <View style={[styles.pill, styles.pillSelected]}>
        <Text style={[styles.label, styles.labelSelected]}>{pill.label}</Text>
      </View>
    );
  }
  return (
    <Pressable style={styles.pill}>
      {pill.kind === 'sort' && (
        <Ionicons name="swap-vertical" size={10} color={colors.ink} />
      )}
      <Text style={styles.label}>{pill.label}</Text>
      {(pill.kind === 'sort' || pill.kind === 'dropdown') && (
        <Ionicons name="chevron-down" size={10} color={colors.ink} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 7,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.pillBg,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  pillSelected: {
    backgroundColor: colors.pillSelectedBg,
    borderWidth: 1,
    borderColor: '#E8E7EC',
  },
  label: {
    fontFamily: fonts.titleMedium,
    fontSize: 12,
    color: colors.ink,
  },
  labelSelected: {
    fontFamily: fonts.bodySemibold,
    color: colors.pillSelectedInk,
  },
});
