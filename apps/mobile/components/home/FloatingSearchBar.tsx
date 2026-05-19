import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

type Props = {
  placeholder?: string;
  onPress?: () => void;
};

export function FloatingSearchBar({
  placeholder = 'Search to add or book race',
  onPress,
}: Props) {
  return (
    <Pressable style={styles.bar} onPress={onPress}>
      <Ionicons name="search" size={14} color={colors.muted} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
      <View style={styles.mic}>
        <Ionicons name="mic-outline" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.titleMedium,
    fontSize: 12,
    color: colors.muted,
  },
  mic: {
    width: 22,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
