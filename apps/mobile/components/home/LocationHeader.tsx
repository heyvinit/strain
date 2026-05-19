import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/lib/theme';

type Props = {
  defaultCity?: string;
  defaultCountry?: string;
  onPressMap?: () => void;
};

export function LocationHeader({
  defaultCity = 'Dubai',
  defaultCountry = 'United Arab Emirates',
  onPressMap,
}: Props) {
  const [city, setCity] = useState(defaultCity);
  const [country, setCountry] = useState(defaultCountry);

  useEffect(() => {
    let cancelled = false;
    async function resolveLocation() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getLastKnownPositionAsync();
        if (!position) return;
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (cancelled || !place) return;
        if (place.city) setCity(place.city);
        if (place.country) setCountry(place.country);
      } catch {
        // silent fall back to default
      }
    }
    resolveLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <View style={styles.cityRow}>
          <Ionicons name="navigate" size={16} color={colors.ink} />
          <Text style={styles.city}>{city}</Text>
        </View>
        <Text style={styles.country}>{country}</Text>
      </View>
      <Pressable hitSlop={10} onPress={onPressMap}>
        <Ionicons name="map-outline" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    gap: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  city: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: colors.ink,
  },
  country: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
  },
});
