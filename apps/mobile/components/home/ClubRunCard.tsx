import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ClubRun } from '@/lib/mockClubs';
import { colors, fonts, radii, type } from '@/lib/theme';

type Props = {
  run: ClubRun;
  onPress?: () => void;
  onPressRsvp?: () => void;
  width?: number;
};

export function ClubRunCard({ run, onPress, onPressRsvp, width = 300 }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        { width, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: run.gallery[0] }} style={styles.image} contentFit="cover" transition={150} />
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.35, 1]}
          style={styles.overlay}
        />
        <View style={styles.heroTop}>
          <View style={styles.logoWrap}>
            <Image source={{ uri: run.clubLogo }} style={styles.logo} contentFit="cover" />
          </View>
          <Text style={styles.clubName}>{run.clubName}</Text>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.title} numberOfLines={1}>
            {run.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.ink} />
            <Text style={styles.metaText}>
              {run.dayLabel} · {run.time}
            </Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{run.distanceKm}K</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.avatars}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Image
                key={i}
                source={{ uri: run.gallery[(i + 1) % run.gallery.length] }}
                style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}
                contentFit="cover"
              />
            ))}
          </View>
          <Text style={styles.attendees}>
            {run.attendees} going
          </Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onPressRsvp?.();
          }}
          style={({ pressed }) => [
            styles.rsvp,
            run.going && styles.rsvpGoing,
            pressed && { opacity: 0.85 },
          ]}>
          <Text style={[styles.rsvpText, run.going && styles.rsvpTextGoing]}>
            {run.going ? 'Going' : 'RSVP'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  heroWrap: {
    height: 180,
    position: 'relative',
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  heroTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.pill,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoWrap: {
    width: 22,
    height: 22,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.imageBg,
  },
  logo: { width: '100%', height: '100%' },
  clubName: {
    ...type.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
  },
  heroBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    gap: 4,
  },
  title: {
    ...type.h2,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    ...type.caption,
    color: colors.ink,
    opacity: 0.95,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.imageBg,
  },
  attendees: {
    ...type.label,
    color: colors.body,
  },
  rsvp: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  rsvpGoing: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(42,197,127,0.5)',
  },
  rsvpText: {
    ...type.label,
    color: colors.bg,
    fontFamily: fonts.bodyBold,
  },
  rsvpTextGoing: {
    color: colors.success,
  },
});
