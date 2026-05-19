import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/lib/theme';

type Props = {
  children: string;
  size?: 14 | 16;
};

export function SectionTitle({ children, size = 16 }: Props) {
  return <Text style={[styles.title, { fontSize: size }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.titleMedium,
    color: colors.ink,
  },
});
