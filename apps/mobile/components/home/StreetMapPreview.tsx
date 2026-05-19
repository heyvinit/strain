import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/lib/theme';

const STREET_MAP =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80';

type Props = {
  height?: number;
};

export function StreetMapPreview({ height = 580 }: Props) {
  return (
    <View style={[styles.wrap, { height }]}>
      <Image
        source={{ uri: STREET_MAP }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
