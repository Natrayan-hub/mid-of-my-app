// Water card — REAL data (manual HealthEntry logs via /api/health/entries).
// Shows today's total vs. a 2 L goal with a one-tap +250 ml quick add.
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card, CardError, CardHeader } from "@/src/components/Card";
import { Skeleton } from "@/src/components/Skeleton";
import { useTheme } from "@/src/theme";

const GOAL_ML = 2000;
export const GLASS_ML = 250;

interface WaterCardProps {
  totalMl: number | null;
  loading: boolean;
  error: string | null;
  offline: boolean;
  onAdd: () => void;
  onRetry: () => void;
  onOpen: () => void;
}

export function WaterCard({
  totalMl, loading, error, offline, onAdd, onRetry, onOpen,
}: WaterCardProps) {
  const { theme } = useTheme();
  const total = totalMl ?? 0;
  const progress = Math.min(total / GOAL_ML, 1);

  return (
    <Card>
      <CardHeader
        icon={<Feather name="droplet" size={16} color={theme.colors.info.default} />}
        label="Water"
        onSeeAll={onOpen}
        seeAllLabel="Log"
      />

      {loading ? (
        <View style={{ gap: theme.space.sm }}>
          <Skeleton height={28} width="50%" />
          <Skeleton height={6} radius={999} />
        </View>
      ) : error ? (
        <CardError message={error} onRetry={onRetry} />
      ) : (
        <View style={styles.row}>
          <View style={styles.info}>
            <View style={styles.valueRow}>
              <Text
                style={[
                  theme.type.h2,
                  { color: theme.colors.text.primary, fontVariant: ["tabular-nums"] },
                ]}
              >
                {total >= 1000 ? `${(total / 1000).toFixed(2)} L` : `${total} ml`}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
                {` of ${GOAL_ML / 1000} L`}
              </Text>
            </View>
            <View
              style={[
                styles.track,
                { backgroundColor: theme.colors.surface.sunken, borderRadius: theme.radius.full },
              ]}
            >
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: theme.colors.info.default,
                    borderRadius: theme.radius.full,
                    width: `${Math.max(progress * 100, 2)}%`,
                  },
                ]}
              />
            </View>
            {total === 0 ? (
              <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
                Nothing logged yet — tap to add your first glass
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel={`Add ${GLASS_ML} milliliters of water`}
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.surface.primarySubtle, borderRadius: theme.radius.sm },
            ]}
          >
            <Feather name="plus" size={16} color={theme.colors.primary.subtleText} />
            <Text style={[theme.type.label, { color: theme.colors.primary.subtleText }]}>
              {`${GLASS_ML} ml`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {offline ? (
        <Text style={[theme.type.caption, { color: theme.colors.text.tertiary, marginTop: theme.space.xs }]}>
          Offline — logs will sync when you're back
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  info: { flex: 1, gap: 8 },
  valueRow: { flexDirection: "row", alignItems: "baseline" },
  track: { height: 6, overflow: "hidden" },
  fill: { height: 6 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 12,
  },
});
