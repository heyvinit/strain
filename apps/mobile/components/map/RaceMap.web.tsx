import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Race } from '@/lib/mockRaces';
import { colors, fonts, type } from '@/lib/theme';

const STREET_MAP =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80';

type Props = {
  races: Race[];
  selectedId: string | null;
  onSelect: (raceId: string) => void;
};

// Web fallback — react-native-maps doesn't ship a usable web build. We render
// a stylised static map and place pins by normalising race lat/lng to the
// visible area. Native build (RaceMap.native.tsx) uses the real map.
export default function RaceMap({ races, selectedId, onSelect }: Props) {
  const lats = races.map((r) => r.lat);
  const lngs = races.map((r) => r.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.15 || 0.2;
  const padLng = (maxLng - minLng) * 0.15 || 0.2;

  return (
    <View style={styles.wrap}>
      <Image source={{ uri: STREET_MAP }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.tint} pointerEvents="none" />

      {races.map((race) => {
        const xPct = ((race.lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * 100;
        const yPct = 100 - ((race.lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * 100;
        const active = race.id === selectedId;
        return (
          <Pressable
            key={race.id}
            onPress={() => onSelect(race.id)}
            style={[styles.pinPos, { left: `${xPct}%`, top: `${yPct}%` }]}>
            <View style={[styles.pin, active && styles.pinActive]}>
              <Text style={[styles.pinText, active && styles.pinTextActive]}>
                {race.distanceLabel}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pinPos: {
    position: 'absolute',
    transform: [{ translateX: -22 }, { translateY: -16 }],
  },
  pin: {
    backgroundColor: colors.bg,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pinActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pinText: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  pinTextActive: {
    color: colors.ink,
  },
});
