// S6 header: time-of-day greeting + date, avatar (→ profile, stub) and
// notifications bell (→ S8, stub).
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface TodayHeaderProps {
  name: string;
  onPressAvatar: () => void;
  onPressBell: () => void;
}

export function TodayHeader({ name, onPressAvatar, onPressBell }: TodayHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + theme.space.xs }]}>
      <View style={styles.titleBlock}>
        <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
          {formatDate()}
        </Text>
        <Text style={[theme.type.h1, { color: theme.colors.text.primary }]}>
          {`${greetingForNow()}, ${name}`}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPressBell}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.iconButton}
        >
          <Feather name="bell" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressAvatar}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          style={styles.iconButton}
        >
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface.primarySubtle }]}>
            <Text style={[theme.type.label, { color: theme.colors.primary.subtleText }]}>
              {name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  titleBlock: { flex: 1, paddingRight: 8 },
  actions: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
