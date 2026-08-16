// Shared onboarding step frame: back chevron, progress dots, title/subtitle,
// scrollable content, sticky primary CTA (+ optional skip). Keyboard-aware.
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

const TOTAL_STEPS = 4; // Account · Privacy · Permissions · Personalize

interface OnboardingScaffoldProps {
  step?: number; // 1-based; omit on Welcome
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  loading?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  showBack?: boolean;
}

export function OnboardingScaffold({
  step, title, subtitle, children, primaryLabel, onPrimary,
  primaryDisabled, loading, skipLabel, onSkip, showBack = true,
}: OnboardingScaffoldProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: theme.colors.bg.canvas }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + theme.space.xs }]}>
        {showBack && router.canGoBack() ? (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        {step ? (
          <View style={styles.dots} accessibilityLabel={`Step ${step} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < step ? theme.colors.primary.default : theme.colors.border.strong,
                    width: i === step - 1 ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[theme.type.h1, { color: theme.colors.text.primary }]}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              theme.type.body,
              { color: theme.colors.text.secondary, marginTop: theme.space.xs },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
        <View style={{ marginTop: theme.space.lg }}>{children}</View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        <TouchableOpacity
          onPress={onPrimary}
          disabled={primaryDisabled || loading}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          accessibilityState={{ disabled: !!(primaryDisabled || loading) }}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                primaryDisabled && !loading
                  ? theme.colors.surface.sunken
                  : theme.colors.primary.default,
              borderRadius: theme.radius.sm,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text.onPrimary} />
          ) : (
            <Text
              style={[
                theme.type.label,
                {
                  color: primaryDisabled
                    ? theme.colors.text.disabled
                    : theme.colors.text.onPrimary,
                  fontSize: 16,
                },
              ]}
            >
              {primaryLabel}
            </Text>
          )}
        </TouchableOpacity>
        {skipLabel && onSkip ? (
          <TouchableOpacity
            onPress={onSkip}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
            style={styles.skipButton}
          >
            <Text style={[theme.type.label, { color: theme.colors.text.link }]}>
              {skipLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 999 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  footer: { paddingHorizontal: 24, gap: 8 },
  primaryButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
