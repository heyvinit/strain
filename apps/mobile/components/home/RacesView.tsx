import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyTile } from '@/components/home/EmptyTile';
import { FilterPills } from '@/components/home/FilterPills';
import { FloatingSearchBar } from '@/components/home/FloatingSearchBar';
import { GlobePreview } from '@/components/home/GlobePreview';
import { RaceFeatureCard } from '@/components/home/RaceFeatureCard';
import { RaceHeroCard } from '@/components/home/RaceHeroCard';
import { RaceListRow } from '@/components/home/RaceListRow';
import { SectionTitle } from '@/components/home/SectionTitle';
import { SpotlightCard } from '@/components/home/SpotlightCard';
import { mockRaces } from '@/lib/mockRaces';
import { colors, layout } from '@/lib/theme';

const SPOTLIGHT = [
  { id: '1', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27', w: 159, h: 192 },
  { id: '2', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27', w: 181, h: 222 },
  { id: '3', title: 'Night Race', category: 'Road Racing', date: '12 Jan 27', w: 159, h: 192 },
];

const FEATURED = [
  { id: 'a', title: "L'Etap Dubai", date: '12 Jan 27', city: 'Dubai', distance: '1.8km, 20km, 67km, 112km', category: 'Road Cycling' },
  { id: 'b', title: "L'Etap Dubai", date: '12 Jan 27', city: 'Dubai', distance: '1.8km, 20km, 67km, 112km', category: 'Road Cycling' },
];

const HERO_RACES = mockRaces.slice(0, 3);
const LIST_RACES = mockRaces.slice(3, 7);

export function RacesView() {
  const openRace = (id: string) =>
    router.push({ pathname: '/race/[id]', params: { id } });

  return (
    <View>
      <GlobePreview />

      <View style={styles.body}>
        <FloatingSearchBar />

        <View style={styles.gutter}>
          <FilterPills />
        </View>

        <View style={styles.section}>
          <SectionTitle size={14}>Upcoming Races In UAE</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroRow}>
            {HERO_RACES.map((race) => (
              <RaceHeroCard
                key={race.id}
                race={race}
                onPress={() => openRace(race.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.spotlightSection}>
        <View style={styles.gutter}>
          <SectionTitle>In Spotlight</SectionTitle>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotRow}>
          {SPOTLIGHT.map((s) => (
            <SpotlightCard
              key={s.id}
              title={s.title}
              category={s.category}
              date={s.date}
              width={s.w}
              height={s.h}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.body}>
        <View style={[styles.section, { gap: 16 }]}>
          <SectionTitle>Types of Races</SectionTitle>
          <View style={styles.typesGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <EmptyTile key={i} width={85} height={87} />
            ))}
          </View>
        </View>

        <View style={[styles.section, { gap: 8 }]}>
          <SectionTitle>More to explore</SectionTitle>
          <View style={styles.listWrap}>
            {LIST_RACES.map((race, i) => (
              <View key={race.id}>
                {i > 0 && <View style={styles.listDivider} />}
                <RaceListRow race={race} onPress={() => openRace(race.id)} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featureRow}>
        {FEATURED.map((f) => (
          <RaceFeatureCard
            key={f.id}
            title={f.title}
            date={f.date}
            city={f.city}
            distance={f.distance}
            category={f.category}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.bg,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 24,
    gap: 20,
  },
  gutter: {
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
  },
  section: {
    gap: 16,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 18,
  },
  spotlightSection: {
    paddingVertical: 24,
    gap: 16,
  },
  spotRow: {
    paddingHorizontal: layout.screenPadding,
    gap: 16,
    alignItems: 'center',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  featureRow: {
    paddingHorizontal: layout.screenPadding,
    gap: 16,
    paddingBottom: 8,
  },
  heroRow: {
    gap: 14,
    paddingRight: 4,
  },
  listWrap: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
});
