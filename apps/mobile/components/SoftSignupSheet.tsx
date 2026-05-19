import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { forwardRef, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts, layout, radii, type } from '@/lib/theme';

export type SoftSignupSheetRef = BottomSheetModal;

type Props = {
  onDismiss?: () => void;
};

export const SoftSignupSheet = forwardRef<BottomSheetModal, Props>(
  function SoftSignupSheet({ onDismiss }, ref) {
    const [email, setEmail] = useState('');

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.55}
        />
      ),
      [],
    );

    const close = () => {
      if (ref && typeof ref === 'object') ref.current?.dismiss();
    };

    const handleStrava = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      close();
    };

    const handleEmail = () => {
      if (email.trim().length < 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      close();
    };

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bg}
        handleIndicatorStyle={styles.handle}
        enableDynamicSizing
        onDismiss={onDismiss}>
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Save your race history</Text>
          <Text style={styles.body}>
            Strain auto-pulls your results, builds your passport, and keeps your race week
            organised. Connect once.
          </Text>

          <Pressable
            onPress={handleStrava}
            style={({ pressed }) => [styles.strava, pressed && { opacity: 0.9 }]}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={styles.stravaLabel}>Continue with Strava</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.emailRow}>
            <TextInput
              placeholder="you@email.com"
              placeholderTextColor={colors.mutedSoft}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.emailInput}
            />
            <Pressable
              onPress={handleEmail}
              style={({ pressed }) => [styles.emailBtn, pressed && { opacity: 0.9 }]}>
              <Ionicons name="arrow-forward" size={18} color={colors.bg} />
            </Pressable>
          </View>

          <Pressable hitSlop={10} onPress={close} style={styles.laterBtn}>
            <Text style={styles.laterLabel}>Maybe later</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  handle: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 40,
    height: 4,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    ...type.h1,
    color: colors.ink,
  },
  body: {
    ...type.body,
    color: colors.body,
  },
  strava: {
    marginTop: 8,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: '#FC4C02',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stravaLabel: {
    ...type.h3,
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  dividerLabel: {
    ...type.micro,
    color: colors.body,
    letterSpacing: 1.2,
  },
  emailRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  emailBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  laterLabel: {
    ...type.bodySmall,
    color: colors.muted,
  },
});
