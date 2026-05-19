import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radii } from '@/lib/theme';

type Props = {
  width?: number | string;
  height?: number;
  bordered?: boolean;
  style?: ViewStyle;
};

export function EmptyTile({ width, height, bordered, style }: Props) {
  return (
    <View
      style={[
        styles.tile,
        bordered && styles.bordered,
        { width: width as number | undefined, height },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  bordered: {
    borderWidth: 3,
    borderColor: colors.surfaceBorderSoft,
  },
});
