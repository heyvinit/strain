import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const ROCK_WIDTH = SCREEN_W * 0.7;
const ROCK_HEIGHT = ROCK_WIDTH * (257.35 / 274.3);

type Props = {
  onComplete: () => void;
};

export function SplashAnimator({ onComplete }: Props) {
  const rockX = useSharedValue(0);
  const rockY = useSharedValue(0);
  const rockOpacity = useSharedValue(1);
  const rockScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    hapticInterval.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }, 90);

    rockX.value = withRepeat(
      withSequence(
        withTiming(-2.5, { duration: 35 }),
        withTiming(2.5, { duration: 35 }),
        withTiming(-1.5, { duration: 35 }),
        withTiming(1.5, { duration: 35 }),
      ),
      -1,
      true,
    );
    rockY.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 45 }),
        withTiming(-1.5, { duration: 45 }),
      ),
      -1,
      true,
    );

    const breakTimer = setTimeout(() => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

      flashOpacity.value = withSequence(
        withTiming(1, { duration: 70, easing: Easing.in(Easing.cubic) }),
        withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
      );

      rockScale.value = withTiming(1.15, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      rockOpacity.value = withTiming(0, { duration: 200 });

      containerOpacity.value = withDelay(
        320,
        withTiming(
          0,
          { duration: 380, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(onComplete)();
          },
        ),
      );
    }, 1300);

    return () => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      clearTimeout(breakTimer);
    };
  }, [containerOpacity, flashOpacity, onComplete, rockOpacity, rockScale, rockX, rockY]);

  const rockStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rockX.value },
      { translateY: rockY.value },
      { scale: rockScale.value },
    ],
    opacity: rockOpacity.value,
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.rockWrap, rockStyle]}>
        <Image
          source={require('@/assets/images/rock.png')}
          style={styles.rock}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.flash, flashStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  rockWrap: {
    width: ROCK_WIDTH,
    height: ROCK_HEIGHT,
  },
  rock: {
    width: '100%',
    height: '100%',
  },
  flash: {
    backgroundColor: '#FFFFFF',
  },
});
