import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAddedRaces } from '@/lib/addedRaces';
import { mockRaces } from '@/lib/mockRaces';
import { colors, fonts, layout, radii, type } from '@/lib/theme';

const HERO_HEIGHT = 380;

const INCLUDED = [
  'Race kit pickup the day before',
  'Aid stations every 5K',
  'Finisher medal and tech tee',
  'Live tracking link via Strain',
  'Auto-saved to your passport',
];

export default function RaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const race = mockRaces.find((r) => r.id === id);
  const { addRace, removeBySourceId, isSourceSaved } = useAddedRaces();
  const saved = race ? isSourceSaved(race.id) : false;

  const handleToggleSave = () => {
    if (!race) return;
    if (saved) {
      removeBySourceId(race.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      addRace({
        name: race.name,
        distance: race.distanceLabel,
        date: race.date,
        city: race.city,
        sourceRaceId: race.id,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  if (!race) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.notFoundText}>Race not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: race.heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <View style={styles.iconBtnRow}>
              <Pressable hitSlop={12} style={styles.iconBtn}>
                <Ionicons name="heart-outline" size={20} color={colors.ink} />
              </Pressable>
              <Pressable hitSlop={12} style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color={colors.ink} />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <Text style={styles.sport}>
              {race.sport.toUpperCase()} · {race.country}
            </Text>
            <Text style={styles.heroTitle}>{race.name}</Text>
            <Text style={styles.heroSub}>
              {race.date} · {race.venue}, {race.city}
            </Text>
            <View style={styles.hypeChip}>
              <View
                style={[
                  styles.dot,
                  race.hype.tone === 'urgent' && { backgroundColor: colors.warning },
                ]}
              />
              <Text style={styles.hypeText}>{race.hype.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{race.distanceLabel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DATE</Text>
              <Text style={styles.statValue}>{race.dateShort}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>FROM</Text>
              <Text style={styles.statValue}>{race.priceFrom}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this race</Text>
            <Text style={styles.bodyText}>
              {race.name} returns to {race.city} on {race.date}. A {race.distanceLabel}{' '}
              {race.sport.toLowerCase()} starting and finishing at {race.venue}. Course details,
              wave info, and weather will appear here once your booking is confirmed.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What&apos;s included</Text>
            <View style={styles.bullets}>
              {INCLUDED.map((line) => (
                <View key={line} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bodyText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapTile}>
              <Ionicons name="map-outline" size={28} color={colors.mutedSoft} />
              <Text style={styles.mapHint}>Map preview coming soon</Text>
            </View>
            <Text style={styles.bodySmall}>
              {race.venue} · {race.city}, {race.country}
            </Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.ctaWrap}>
        <View style={styles.ctaRow}>
          <Pressable
            onPress={handleToggleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              saved && styles.saveBtnActive,
              pressed && { opacity: 0.9 },
            ]}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? colors.accent : colors.ink}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            }}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
            <View style={styles.ctaLeft}>
              <Text style={styles.ctaPriceLabel}>FROM</Text>
              <Text style={styles.ctaPrice}>{race.priceFrom}</Text>
            </View>
            <View style={styles.ctaRight}>
              <Text style={styles.ctaLabel}>Register</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.bg} />
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingBottom: 140,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    color: colors.body,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  heroWrap: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: colors.imageBg,
    overflow: 'hidden',
  },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  iconBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 24,
    left: layout.screenPadding,
    right: layout.screenPadding,
    gap: 6,
  },
  sport: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.4,
  },
  heroTitle: {
    ...type.display,
    color: colors.ink,
  },
  heroSub: {
    ...type.bodySmall,
    color: 'rgba(255,255,255,0.85)',
  },
  hypeChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  hypeText: {
    ...type.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    gap: 28,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 16,
    alignItems: 'stretch',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 4,
  },
  statLabel: {
    ...type.micro,
    color: colors.body,
    letterSpacing: 0.8,
  },
  statValue: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  section: { gap: 12 },
  sectionTitle: {
    ...type.h2,
    color: colors.ink,
  },
  bodyText: {
    ...type.body,
    color: colors.body,
    flex: 1,
  },
  bodySmall: {
    ...type.bodySmall,
    color: colors.body,
  },
  bullets: { gap: 10 },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.body,
    marginTop: 9,
  },
  mapTile: {
    height: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapHint: {
    ...type.caption,
    color: colors.mutedSoft,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  saveBtn: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  cta: {
    flex: 1,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  ctaLeft: { gap: 1 },
  ctaPriceLabel: {
    ...type.micro,
    color: 'rgba(0,0,0,0.55)',
    letterSpacing: 1.0,
  },
  ctaPrice: {
    ...type.bodySmall,
    fontFamily: fonts.bodyBold,
    color: colors.bg,
  },
  ctaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaLabel: {
    ...type.h3,
    color: colors.bg,
    fontFamily: fonts.bodyBold,
  },
});
