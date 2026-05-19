import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

export type HomeMode = 'races' | 'clubs';

type Props = {
  value: HomeMode;
  onChange: (next: HomeMode) => void;
};

const OPTIONS: { key: HomeMode; label: string }[] = [
  { key: 'races', label: 'Races' },
  { key: 'clubs', label: 'Run Clubs' },
];

export function ModeToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => {
              if (active) return;
              Haptics.selectionAsync().catch(() => {});
              onChange(option.key);
            }}
            style={[styles.option, active && styles.optionActive]}>
            <Text style={[styles.label, !active && styles.labelInactive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  optionActive: {
    backgroundColor: colors.toggleTrack,
  },
  label: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: -0.28,
  },
  labelInactive: {
    opacity: 0.4,
  },
});
