import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ClubFilterPills } from '@/components/home/ClubFilterPills';
import { EmptyTile } from '@/components/home/EmptyTile';
import { FloatingSearchBar } from '@/components/home/FloatingSearchBar';
import { GlobePreview } from '@/components/home/GlobePreview';
import { RunClubEventCard } from '@/components/home/RunClubEventCard';
import { RunClubLargeCard } from '@/components/home/RunClubLargeCard';
import { SectionTitle } from '@/components/home/SectionTitle';
import { colors, fonts, layout } from '@/lib/theme';

const UPCOMING_RUNS = [
  { id: '1', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', attendees: 9 },
  { id: '2', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', attendees: 9 },
];

const WEEK_GROUPS = [
  {
    day: 'Tue 13',
    events: [
      { id: '1', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', when: '12 Jan 27', attendees: 9, going: true },
      { id: '2', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', when: '12 Jan 27', attendees: 9 },
    ],
  },
  {
    day: 'Fri 16',
    events: [
      { id: '3', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', when: '12 Jan 27', attendees: 9 },
      { id: '4', title: 'LFG Club', date: '12 Jan 27', location: 'Kite Beach, Dubai', distance: '5k', when: '12 Jan 27', attendees: 9 },
    ],
  },
];

export function RunClubsView() {
  return (
    <View>
      <GlobePreview />

      <View style={styles.body}>
        <FloatingSearchBar placeholder="Search to add or book race" />

        <View style={styles.section}>
          <SectionTitle>Upcoming Runs near you</SectionTitle>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.largeRow}>
        {UPCOMING_RUNS.map((r) => (
          <RunClubLargeCard
            key={r.id}
            title={r.title}
            date={r.date}
            location={r.location}
            distance={r.distance}
            attendees={r.attendees}
          />
        ))}
      </ScrollView>

      <View style={styles.body}>
        <View style={styles.section}>
          <SectionTitle>Clubs near you</SectionTitle>
          <View style={styles.clubGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <EmptyTile key={i} width={70} height={70} />
            ))}
          </View>
        </View>

        <View style={[styles.section, { gap: 14 }]}>
          <SectionTitle>This week</SectionTitle>
          <View style={styles.gutterRow}>
            <ClubFilterPills />
          </View>
        </View>

        {WEEK_GROUPS.map((group) => (
          <View key={group.day} style={styles.dayGroup}>
            <Text style={styles.dayLabel}>{group.day}</Text>
            {group.events.map((event) => (
              <RunClubEventCard
                key={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                distance={event.distance}
                when={event.when}
                attendees={event.attendees}
                going={event.going}
              />
            ))}
          </View>
        ))}
      </View>
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
  section: {
    gap: 16,
  },
  gutterRow: {
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
  },
  largeRow: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 14,
  },
  clubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  dayGroup: {
    gap: 12,
  },
  dayLabel: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    color: colors.ink,
  },
});
