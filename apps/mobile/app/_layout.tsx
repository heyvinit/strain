import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { SplashAnimator } from '@/components/SplashAnimator';
import { AddedRacesProvider } from '@/lib/addedRaces';
import { useAppFonts } from '@/lib/useAppFonts';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

const StrainDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
  },
};

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const fontsLoaded = useAppFonts();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={StrainDarkTheme}>
          <AddedRacesProvider>
            <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="race/[id]"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="add-race"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="map"
                options={{ headerShown: false, animation: 'slide_from_bottom' }}
              />
            </Stack>
            {(!splashDone || !fontsLoaded) && (
              <SplashAnimator onComplete={() => setSplashDone(true)} />
            )}
            <StatusBar style="light" />
          </AddedRacesProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
