import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyTile } from '@/components/home/EmptyTile';
import { FilterPills } from '@/components/home/FilterPills';
import { FloatingSearchBar } from '@/components/home/FloatingSearchBar';
import { GlobePreview } from '@/components/home/GlobePreview';
import { RaceFeatureCard } from '@/components/home/RaceFeatureCard';
import { SectionTitle } from '@/components/home/SectionTitle';
import { SpotlightCard } from '@/components/home/SpotlightCard';
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

export function RacesView() {
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
          <View style={styles.twoCol}>
            <EmptyTile bordered width={188.77} height={192} />
            <EmptyTile bordered width={189} height={192} />
          </View>
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

        <View style={[styles.section, { gap: 24 }]}>
          <SectionTitle>Upcoming Races In UAE</SectionTitle>
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
});
