import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/lib/theme';

const GLOBE_URI =
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=1600&q=80';

type Props = {
  onPress?: () => void;
};

export function GlobePreview({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Image
        source={{ uri: GLOBE_URI }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 390 / 153,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
