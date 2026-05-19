import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RaceMap from '@/components/map/RaceMap';
import { mockRaces, type Race } from '@/lib/mockRaces';
import { colors, fonts, layout, radii, type } from '@/lib/theme';

const CARD_WIDTH = Math.min(280, Dimensions.get('window').width - 80);
const CARD_GAP = 12;

export default function MapScreen() {
  const [selectedId, setSelectedId] = useState<string>(mockRaces[0]?.id ?? '');
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = (raceId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedId(raceId);
    const idx = mockRaces.findIndex((r) => r.id === raceId);
    if (idx >= 0) {
      scrollRef.current?.scrollTo({ x: idx * (CARD_WIDTH + CARD_GAP), animated: true });
    }
  };

  const handleScrollEnd = (offsetX: number) => {
    const idx = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    const next = mockRaces[idx];
    if (next && next.id !== selectedId) {
      setSelectedId(next.id);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  return (
    <View style={styles.root}>
      <RaceMap races={mockRaces} selectedId={selectedId} onSelect={handleSelect} />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
        locations={[0, 1]}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <SafeAreaView edges={['top']} style={styles.headerSafe} pointerEvents="box-none">
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Races near you</Text>
            <Text style={styles.subtitle}>{mockRaces.length} events</Text>
          </View>
          <Pressable hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.cardsWrap} pointerEvents="box-none">
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => handleScrollEnd(e.nativeEvent.contentOffset.x)}
          contentContainerStyle={styles.cardsRow}>
          {mockRaces.map((race) => (
            <MapRaceCard
              key={race.id}
              race={race}
              active={race.id === selectedId}
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: race.id } })}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function MapRaceCard({
  race,
  active,
  onPress,
}: {
  race: Race;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && { opacity: 0.95 },
      ]}>
      <Image source={{ uri: race.heroImage }} style={styles.cardImage} contentFit="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardSport}>{race.sport.toUpperCase()}</Text>
        <Text style={styles.cardName} numberOfLines={1}>
          {race.name}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={11} color={colors.body} />
          <Text style={styles.cardMetaText}>{race.dateShort}</Text>
          <View style={styles.cardDot} />
          <Ionicons name="location-outline" size={11} color={colors.body} />
          <Text style={styles.cardMetaText} numberOfLines={1}>
            {race.city}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  titleWrap: {
    alignItems: 'center',
    gap: 1,
  },
  title: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  subtitle: {
    ...type.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  cardsWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
  },
  cardsRow: {
    paddingHorizontal: 24,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: colors.accent,
  },
  cardImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.imageBg,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    justifyContent: 'center',
  },
  cardSport: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: colors.body,
    letterSpacing: 1.2,
  },
  cardName: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cardMetaText: {
    ...type.caption,
    color: colors.body,
  },
  cardDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.body,
    marginHorizontal: 4,
  },
});
