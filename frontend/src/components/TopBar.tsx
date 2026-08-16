// Global top app bar (Design System E.4): large-title at rest.
// Collapsing-on-scroll behavior arrives with real screens; this static
// version establishes the layout contract (title + optional right actions).
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

export interface TopBarAction {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  badge?: number;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: TopBarAction[];
}

export function TopBar({ title, subtitle, actions = [] }: TopBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.space.xs }]}>
      <View style={styles.titleBlock}>
        {subtitle ? (
          <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={[theme.type.h1, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
      </View>
      <View style={styles.actions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.icon}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.actionButton}
          >
            <Feather name={action.icon} size={24} color={theme.colors.text.secondary} />
            {action.badge ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.error.default }]}>
                <Text style={[theme.type.labelSm, { color: theme.colors.text.onPrimary }]}>
                  {action.badge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16, // layout.margin
    paddingBottom: 8,
  },
  titleBlock: { flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
