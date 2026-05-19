import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

type Props = {
  title: string;
  date: string;
  location: string;
  distance: string;
  attendees: number;
  width?: number;
};

export function RunClubLargeCard({
  title,
  date,
  location,
  distance,
  attendees,
  width = 320,
}: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.hero}>
        <View style={styles.sunBadge}>
          <Ionicons name="sunny-outline" size={14} color={colors.ink} />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title.toUpperCase()}</Text>
              <Text style={styles.date}>{date}</Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="location-outline" size={10} color={colors.body} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="trail-sign-outline" size={10} color={colors.body} />
              <Text style={styles.metaText}>{distance}</Text>
            </View>
            <View style={styles.avatarRow}>
              <Avatars count={3} />
              <Text style={styles.attendeesText}>+{attendees}</Text>
            </View>
          </View>
          <Pressable style={styles.rsvp}>
            <Text style={styles.rsvpText}>RSVP</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Avatars({ count }: { count: number }) {
  return (
    <View style={styles.avatars}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8, zIndex: count - i }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  hero: {
    height: 180,
    borderRadius: radii.md,
    backgroundColor: colors.empty,
    padding: 12,
    alignItems: 'flex-end',
  },
  sunBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.6,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.body,
    letterSpacing: -0.2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.surface,
    backgroundColor: colors.empty,
  },
  attendeesText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.body,
  },
  rsvp: {
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  rsvpText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
});
