import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { type Race } from '@/lib/mockRaces';
import { colors, fonts, type } from '@/lib/theme';

type Props = {
  races: Race[];
  selectedId: string | null;
  onSelect: (raceId: string) => void;
};

export default function RaceMap({ races, selectedId, onSelect }: Props) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const race = races.find((r) => r.id === selectedId);
    if (!race || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: race.lat,
        longitude: race.lng,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      },
      450,
    );
  }, [selectedId, races]);

  const initialRegion: Region = {
    latitude: races[0]?.lat ?? 25.2,
    longitude: races[0]?.lng ?? 55.27,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      userInterfaceStyle="dark"
      showsCompass={false}
      showsPointsOfInterest={false}>
      {races.map((race) => {
        const active = race.id === selectedId;
        return (
          <Marker
            key={race.id}
            coordinate={{ latitude: race.lat, longitude: race.lng }}
            onPress={() => onSelect(race.id)}>
            <Pressable hitSlop={6}>
              <View style={[styles.pin, active && styles.pinActive]}>
                <Text style={[styles.pinText, active && styles.pinTextActive]} numberOfLines={1}>
                  {race.distanceLabel}
                </Text>
              </View>
            </Pressable>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
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
