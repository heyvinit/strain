import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/lib/theme';

type Props = {
  title: string;
  date: string;
  location: string;
  distance: string;
  when: string;
  attendees: number;
  going?: boolean;
};

export function RunClubEventCard({
  title,
  date,
  location,
  distance,
  when,
  attendees,
  going,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.date}>{date}</Text>
          {going && (
            <View style={styles.goingBadge}>
              <Text style={styles.goingText}>Going</Text>
            </View>
          )}
        </View>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={10} color={colors.body} />
          <Text style={styles.metaText}>{location}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="trail-sign-outline" size={10} color={colors.body} />
          <Text style={styles.metaText}>{distance}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={10} color={colors.body} />
          <Text style={styles.metaText}>{when}</Text>
        </View>
        <View style={styles.avatarRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]}
            />
          ))}
          <Text style={styles.attendees}>+{attendees}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
  },
  thumb: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: colors.empty,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    letterSpacing: -0.2,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.body,
  },
  goingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31,157,85,0.5)',
  },
  goingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.success,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.surface,
    backgroundColor: colors.empty,
  },
  attendees: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.body,
  },
});
