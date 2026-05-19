import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

const DEFAULT = ['All Clubs', 'LFG', 'J.Jhones', 'AVG Run', 'Stride'];

type Props = {
  options?: string[];
  active?: string;
  onChange?: (value: string) => void;
};

export function ClubFilterPills({
  options = DEFAULT,
  active = 'All Clubs',
  onChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange?.(opt)}
            style={[styles.pill, isActive && styles.pillActive]}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#2B2B2B',
  },
  pillActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#3A3A3A',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.body,
  },
  labelActive: {
    color: colors.ink,
  },
});
