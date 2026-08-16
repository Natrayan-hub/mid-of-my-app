// Global Quick-Add bottom sheet (IA A.4): opened by the raised ＋ in the tab
// bar from anywhere. Skeleton phase: the four actions render and dismiss;
// each will route into its real flow (S12 / S19 / S16) as screens are built.
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal, Pressable, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

interface QuickAddAction {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  hint: string;
  disabled?: boolean;
}

const ACTIONS: QuickAddAction[] = [
  { key: "task", icon: "check-circle", label: "New task", hint: "Type it naturally — \u201cgym tomorrow 7am\u201d" },
  { key: "scan", icon: "camera", label: "Scan document", hint: "Snap, auto-crop, and file it" },
  { key: "log", icon: "heart", label: "Health log", hint: "Water, mood, or weight" },
  { key: "event", icon: "calendar", label: "New event", hint: "Coming with calendar sync", disabled: true },
];

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  onAction?: (key: string) => void;
}

export function QuickAddSheet({ visible, onClose, onAction }: QuickAddSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={[styles.scrim, { backgroundColor: theme.colors.overlay.scrim }]}
        onPress={onClose}
        accessibilityLabel="Close quick add"
      />
      <View
        style={[
          styles.sheet,
          theme.elevation.e2,
          {
            backgroundColor: theme.colors.surface.raised,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            paddingBottom: insets.bottom + theme.space.md,
          },
        ]}
      >
        <View style={[styles.grabber, { backgroundColor: theme.colors.border.strong }]} />
        <Text style={[theme.type.h2, { color: theme.colors.text.primary, marginBottom: theme.space.sm }]}>
          Quick add
        </Text>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            disabled={action.disabled}
            onPress={() => {
              onAction?.(action.key);
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: !!action.disabled }}
            style={[styles.row, { opacity: action.disabled ? 0.4 : 1 }]}
          >
            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor: theme.colors.surface.primarySubtle,
                  borderRadius: theme.radius.xs,
                },
              ]}
            >
              <Feather name={action.icon} size={20} color={theme.colors.primary.subtleText} />
            </View>
            <View style={styles.rowText}>
              <Text style={[theme.type.h4, { color: theme.colors.text.primary }]}>
                {action.label}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
                {action.hint}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1 },
  sheet: { paddingHorizontal: 16, paddingTop: 8 },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    minHeight: 52,
  },
  rowIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
});
