// S23 — More hub (stub) + theme mode control so light/dark theming is
// verifiable now; this control graduates to General Settings (S25) later.
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StubScreen } from "@/src/components/StubScreen";
import { ThemeMode, useTheme } from "@/src/theme";

const MODES: ThemeMode[] = ["system", "light", "dark"];

export default function MoreScreen() {
  const { theme, mode, setMode } = useTheme();

  return (
    <StubScreen
      title="More"
      icon="grid"
      description="Profile, integrations, privacy center, backup, and settings live here."
    >
      <View
        style={[
          styles.segmented,
          {
            backgroundColor: theme.colors.surface.sunken,
            borderRadius: theme.radius.sm,
            marginTop: theme.space.lg,
          },
        ]}
      >
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              accessibilityRole="button"
              accessibilityLabel={`${m} theme`}
              accessibilityState={{ selected: active }}
              style={[
                styles.segment,
                active && [
                  theme.elevation.e1,
                  {
                    backgroundColor: theme.colors.surface.default,
                    borderRadius: theme.radius.sm - 2,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  theme.type.label,
                  {
                    color: active
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                    textTransform: "capitalize",
                  },
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StubScreen>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    padding: 3,
    height: 40,
    alignSelf: "stretch",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
