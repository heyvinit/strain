import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAddedRaces } from '@/lib/addedRaces';
import { colors, fonts, layout, radii, type } from '@/lib/theme';

const DISTANCE_PRESETS = ['5K', '10K', '21K', '42K', 'Hyrox', '70.3', '140.6', 'Trail', 'Ultra'];

export default function AddRaceScreen() {
  const { addRace } = useAddedRaces();

  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [touched, setTouched] = useState(false);

  const canSave = name.trim().length >= 2 && distance.trim().length >= 1;

  const handleSave = () => {
    setTouched(true);
    if (!canSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    addRace({
      name: name.trim(),
      distance: distance.trim(),
      date: date.trim() || 'TBC',
      city: city.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add a race</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.kicker}>COMPANION</Text>
            <Text style={styles.lead}>
              Add a race and we&apos;ll handle the rest: expo info, weather, bib release, results.
            </Text>
          </View>

          <Field
            label="Race name"
            placeholder="e.g. London Marathon"
            value={name}
            onChangeText={setName}
            autoFocus
            error={touched && name.trim().length < 2 ? 'Required' : undefined}
          />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Distance</Text>
            <TextInput
              placeholder="e.g. 42K, Half, 70.3"
              placeholderTextColor={colors.mutedSoft}
              value={distance}
              onChangeText={setDistance}
              style={styles.input}
            />
            {touched && distance.trim().length < 1 && (
              <Text style={styles.fieldError}>Required</Text>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}>
              {DISTANCE_PRESETS.map((preset) => {
                const active = distance === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => {
                      setDistance(preset);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    style={[styles.pill, active && styles.pillActive]}>
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {preset}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Field
            label="Date"
            placeholder="e.g. 12 Apr 2026"
            value={date}
            onChangeText={setDate}
          />

          <Field
            label="City"
            placeholder="Optional"
            value={city}
            onChangeText={setCity}
          />
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.ctaWrap}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.cta,
              !canSave && styles.ctaDisabled,
              pressed && canSave && { opacity: 0.9 },
            ]}>
            <Text style={[styles.ctaLabel, !canSave && styles.ctaLabelDisabled]}>
              Save race
            </Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  autoFocus?: boolean;
  error?: string;
};

function Field({ label, placeholder, value, onChangeText, autoFocus, error }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.mutedSoft}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        style={styles.input}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    ...type.h3,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 32,
    gap: 24,
  },
  intro: {
    gap: 8,
    marginBottom: 8,
  },
  kicker: {
    ...type.micro,
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    letterSpacing: 1.4,
  },
  lead: {
    ...type.body,
    color: colors.body,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    ...type.label,
    color: colors.ink,
  },
  input: {
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
  fieldError: {
    ...type.caption,
    color: colors.warning,
  },
  pillRow: {
    gap: 8,
    paddingTop: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.pillBg,
    borderWidth: 1,
    borderColor: colors.pillBorder,
  },
  pillActive: {
    backgroundColor: colors.pillSelectedBg,
    borderColor: colors.pillSelectedBg,
  },
  pillText: {
    ...type.bodySmall,
    color: colors.body,
    fontFamily: fonts.bodyMedium,
  },
  pillTextActive: {
    color: colors.pillSelectedInk,
  },
  ctaWrap: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  cta: {
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  ctaLabel: {
    ...type.h3,
    color: colors.bg,
    fontFamily: fonts.bodyBold,
  },
  ctaLabelDisabled: {
    color: colors.muted,
  },
});
