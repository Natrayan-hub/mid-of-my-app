// Health snapshot card — sleep / steps / active energy mini-tiles with trend
// deltas. Data: LOCAL HealthCache shape (MOCK until a health source is
// connected — honestly labeled in the footer). Tap → Health tab (S14 stub).
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card, CardHeader } from "@/src/components/Card";
import { useTheme } from "@/src/theme";
import type { HealthSnapshot } from "@/src/features/today/mocks";

function formatSleep(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

interface TileProps {
  label: string;
  value: string;
  trend: number;
}

function Tile({ label, value, trend }: TileProps) {
  const { theme } = useTheme();
  const up = trend >= 0;
  const trendColor = up ? theme.colors.success.text : theme.colors.text.secondary;
  return (
    <View style={styles.tile}>
      <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Text
        style={[
          theme.type.h3,
          { color: theme.colors.text.primary, fontVariant: ["tabular-nums"] },
        ]}
      >
        {value}
      </Text>
      <View style={styles.trendRow}>
        <Feather
          name={up ? "arrow-up-right" : "arrow-down-right"}
          size={12}
          color={trendColor}
        />
        <Text style={[theme.type.labelSm, { color: trendColor }]}>
          {`${Math.abs(trend)}% vs 7d`}
        </Text>
      </View>
    </View>
  );
}

interface HealthCardProps {
  snapshot: HealthSnapshot;
  onOpen: () => void;
}

export function HealthCard({ snapshot, onOpen }: HealthCardProps) {
  const { theme } = useTheme();

  return (
    <Card onPress={onOpen} accessibilityLabel="Health summary, open health dashboard">
      <CardHeader
        icon={<Feather name="heart" size={16} color={theme.colors.secondary.default} />}
        label="Health"
        onSeeAll={onOpen}
        seeAllLabel="Details"
      />
      <View style={styles.tiles}>
        <Tile label="Sleep" value={formatSleep(snapshot.sleep.value)} trend={snapshot.trends.sleep} />
        <Tile
          label="Steps"
          value={snapshot.steps.value.toLocaleString()}
          trend={snapshot.trends.steps}
        />
        <Tile
          label="Active"
          value={`${snapshot.activeEnergy.value} kcal`}
          trend={snapshot.trends.activeEnergy}
        />
      </View>
      <Text
        style={[
          theme.type.caption,
          { color: theme.colors.text.tertiary, marginTop: theme.space.sm },
        ]}
      >
        Sample data — connect Apple Health or Health Connect to see yours
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: "row", gap: 12 },
  tile: { flex: 1, gap: 2 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 2 },
});
