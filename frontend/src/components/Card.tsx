// Base card components (Design System E.3). Raised card = Today cards.
// Header row: domain icon + label, optional trailing "See all" link.
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

import { useTheme } from "@/src/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  variant?: "raised" | "flat" | "ai";
}

export function Card({ children, onPress, accessibilityLabel, style, variant = "raised" }: CardProps) {
  const { theme } = useTheme();

  const base: ViewStyle = {
    backgroundColor: variant === "ai" ? theme.colors.surface.aiSubtle : theme.colors.surface.default,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    ...(variant === "ai"
      ? { borderWidth: 1, borderColor: `${theme.colors.ai.default}66` }
      : variant === "flat"
        ? { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border.default }
        : theme.elevation.e1),
  };

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[base, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

interface CardHeaderProps {
  icon: React.ReactNode;
  label: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

export function CardHeader({ icon, label, onSeeAll, seeAllLabel = "See all" }: CardHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        {icon}
        <Text
          style={[
            theme.type.labelSm,
            { color: theme.colors.text.secondary, textTransform: "uppercase" },
          ]}
        >
          {label}
        </Text>
      </View>
      {onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`${seeAllLabel} ${label}`}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[theme.type.label, { color: theme.colors.text.link }]}>
            {seeAllLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// Compact inline error row rendered INSIDE a card frame — sibling cards are
// never affected (IA: Today never fully breaks).
export function CardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.errorRow}>
      <Feather name="alert-triangle" size={16} color={theme.colors.error.default} />
      <Text style={[theme.type.bodySm, styles.errorText, { color: theme.colors.text.secondary }]}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={[theme.type.label, { color: theme.colors.text.link }]}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  errorText: { flex: 1 },
});
