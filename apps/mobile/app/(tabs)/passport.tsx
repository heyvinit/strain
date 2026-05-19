import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyTile } from '@/components/home/EmptyTile';
import { colors, layout, radii } from '@/lib/theme';

const MAP_TILE =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80';

export default function PassportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable hitSlop={10}>
            <Ionicons name="heart-outline" size={22} color={colors.ink} />
          </Pressable>
          <Pressable hitSlop={10}>
            <Ionicons name="open-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <View style={styles.leftCol}>
            <EmptyTile height={236} />
            <EmptyTile height={120} />
          </View>
          <View style={styles.rightCol}>
            <EmptyTile height={170} />
            <View style={styles.mapTileWrap}>
              <Image source={{ uri: MAP_TILE }} style={styles.mapImage} contentFit="cover" />
            </View>
          </View>
        </View>

        <View style={styles.smallThumb} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.bottomNavClearance + 24,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  leftCol: {
    flex: 1,
    gap: 16,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  mapTileWrap: {
    height: 186,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  smallThumb: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
});
