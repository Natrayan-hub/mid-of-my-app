// Custom bottom tab bar (Design System E.4): 5 tabs + raised center
// Quick-Add FAB. Order: Today · Tasks · [＋] · Health · Docs · More.
import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

const TAB_META: Record<string, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  index: { label: "Today", icon: "sun" },
  tasks: { label: "Tasks", icon: "check-circle" },
  health: { label: "Health", icon: "heart" },
  docs: { label: "Docs", icon: "file-text" },
  more: { label: "More", icon: "grid" },
};

// FAB is inserted after the first two tabs (Today, Tasks).
const FAB_POSITION = 2;

interface TabBarComponentProps extends BottomTabBarProps {
  onQuickAdd: () => void;
}

export function TabBar({ state, navigation, onQuickAdd }: TabBarComponentProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const items: React.ReactNode[] = state.routes.map((route, index) => {
    const meta = TAB_META[route.name];
    if (!meta) return null;
    const focused = state.index === index;
    const color = focused ? theme.colors.primary.default : theme.colors.text.secondary;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel={meta.label}
        accessibilityState={{ selected: focused }}
        style={styles.tabItem}
      >
        <Feather name={meta.icon} size={24} color={color} />
        <Text style={[theme.type.labelSm, { color }]}>{meta.label}</Text>
      </TouchableOpacity>
    );
  });

  items.splice(
    FAB_POSITION,
    0,
    <View key="quick-add" style={styles.tabItem}>
      <TouchableOpacity
        onPress={onQuickAdd}
        accessibilityRole="button"
        accessibilityLabel="Quick add"
        style={[
          styles.fab,
          theme.elevation.e2,
          { backgroundColor: theme.colors.primary.default },
        ]}
      >
        <Feather name="plus" size={28} color={theme.colors.text.onPrimary} />
      </TouchableOpacity>
    </View>,
  );

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface.default,
          borderTopColor: theme.colors.border.default,
          paddingBottom: insets.bottom,
          height: theme.layout.tabBarHeight + insets.bottom,
        },
      ]}
    >
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "stretch",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24, // raised above the bar
  },
});
