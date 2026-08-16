// Shared placeholder for every top-level destination during the skeleton
// phase. Renders the screen name in the correct navigation slot — feature
// content replaces the body screen-by-screen in later phases.
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { TopBar, TopBarAction } from "@/src/components/TopBar";
import { useTheme } from "@/src/theme";

interface StubScreenProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  actions?: TopBarAction[];
  children?: React.ReactNode;
}

export function StubScreen({ title, icon, description, actions, children }: StubScreenProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg.canvas }]}>
      <TopBar title={title} actions={actions} />
      <View style={styles.body}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.surface.primarySubtle },
          ]}
        >
          <Feather name={icon} size={32} color={theme.colors.primary.subtleText} />
        </View>
        <Text style={[theme.type.h3, { color: theme.colors.text.primary, marginTop: theme.space.md }]}>
          {title}
        </Text>
        <Text
          style={[
            theme.type.bodySm,
            styles.description,
            { color: theme.colors.text.secondary, marginTop: theme.space.xs },
          ]}
        >
          {description}
        </Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32, // space.xl
    paddingBottom: 96, // visually center above tab bar
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  description: { textAlign: "center" },
});
