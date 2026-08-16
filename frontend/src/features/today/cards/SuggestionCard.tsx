// AI suggestion card (Design System E.3 variant): iris-only visual language,
// explainable "based on…" reason, Accept / Dismiss — never auto-executed.
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card } from "@/src/components/Card";
import { useTheme } from "@/src/theme";
import type { Suggestion } from "@/src/types/models";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onDismiss: () => void;
}

export function SuggestionCard({ suggestion, onAccept, onDismiss }: SuggestionCardProps) {
  const { theme } = useTheme();

  return (
    <Card variant="ai">
      <View style={styles.headerRow}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={16}
          color={theme.colors.ai.default}
        />
        <Text
          style={[
            theme.type.labelSm,
            { color: theme.colors.ai.onSubtle, textTransform: "uppercase" },
          ]}
        >
          Suggestion
        </Text>
      </View>
      <Text style={[theme.type.body, { color: theme.colors.text.primary }]}>
        {suggestion.text}
      </Text>
      <Text
        style={[
          theme.type.caption,
          { color: theme.colors.ai.onSubtle, marginTop: theme.space.xs },
        ]}
      >
        {suggestion.reason}
      </Text>
      <View style={[styles.actions, { marginTop: theme.space.sm }]}>
        <TouchableOpacity
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel="Accept suggestion"
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface.default,
              borderRadius: theme.radius.sm,
              borderWidth: 1,
              borderColor: `${theme.colors.ai.default}66`,
            },
          ]}
        >
          <Text style={[theme.type.label, { color: theme.colors.ai.onSubtle }]}>Sounds good</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss suggestion"
          style={styles.button}
        >
          <Text style={[theme.type.label, { color: theme.colors.text.secondary }]}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
