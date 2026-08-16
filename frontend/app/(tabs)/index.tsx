// S6 — Today at-a-glance dashboard (the real screen).
// Card feed is a flexible list — new cards (calendar, docs, recap) slot in
// by adding entries to the render sequence below.
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useToast } from "@/src/components/Toast";
import {
  addWater, completeTask, fetchTodayTasks, fetchWaterToday, reopenTask,
} from "@/src/features/today/api";
import { HealthCard } from "@/src/features/today/cards/HealthCard";
import { SocialCard } from "@/src/features/today/cards/SocialCard";
import { SuggestionCard } from "@/src/features/today/cards/SuggestionCard";
import { TasksCard } from "@/src/features/today/cards/TasksCard";
import { GLASS_ML, WaterCard } from "@/src/features/today/cards/WaterCard";
import {
  getMockHealthSnapshot, getMockSocialSnapshot, getPlaceholderSuggestion,
} from "@/src/features/today/mocks";
import { TodayHeader } from "@/src/features/today/TodayHeader";
import { useCardData } from "@/src/features/today/useCardData";
import { useTheme } from "@/src/theme";
import type { HealthEntry, Task } from "@/src/types/models";

export default function TodayScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [suggestionState, setSuggestionState] = useState<"pending" | "accepted" | "dismissed">(
    "pending",
  );

  // Real data (backend) — tasks + water logs
  const tasksData = useCardData<Task[]>("today.tasks", fetchTodayTasks);
  const waterData = useCardData<HealthEntry[]>("today.water", fetchWaterToday);

  // Local/mock data — health snapshot (local-only HealthCache shape, S34) and
  // social stats (SocialStat shape); placeholder AI suggestion derived from it.
  const health = useMemo(() => getMockHealthSnapshot(), []);
  const social = useMemo(() => getMockSocialSnapshot(), []);
  const suggestion = useMemo(() => getPlaceholderSuggestion(health), [health]);

  const waterTotal = waterData.data
    ? waterData.data.reduce((sum, entry) => sum + entry.value, 0)
    : null;

  const offline = tasksData.offline || waterData.offline;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([tasksData.refetch(), waterData.refetch()]);
    setRefreshing(false);
  }, [tasksData, waterData]);

  const handleToggleTask = useCallback(
    (task: Task) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const completedAt = new Date().toISOString();
      // Optimistic complete
      tasksData.mutate((current) =>
        (current ?? []).map((t) => (t.id === task.id ? { ...t, completed_at: completedAt } : t)),
      );
      completeTask(task.id).catch(() => {
        tasksData.mutate((current) =>
          (current ?? []).map((t) => (t.id === task.id ? { ...t, completed_at: null } : t)),
        );
        toast.show({ message: "Couldn't complete task — try again" });
      });
      toast.show({
        message: "Task completed",
        actionLabel: "Undo",
        onAction: () => {
          tasksData.mutate((current) =>
            (current ?? []).map((t) => (t.id === task.id ? { ...t, completed_at: null } : t)),
          );
          reopenTask(task.id).catch(() => tasksData.refetch());
        },
      });
    },
    [tasksData, toast],
  );

  const handleAddWater = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const optimistic: HealthEntry = {
      id: `optimistic-${Date.now()}`,
      user_id: "demo-user",
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: "water",
      value: GLASS_ML,
      logged_at: new Date().toISOString(),
    };
    waterData.mutate((current) => [optimistic, ...(current ?? [])]);
    addWater(GLASS_ML).catch(() => {
      waterData.mutate((current) =>
        (current ?? []).filter((entry) => entry.id !== optimistic.id),
      );
      toast.show({ message: "Couldn't log water — try again" });
    });
  }, [waterData, toast]);

  const handleAcceptSuggestion = useCallback(() => {
    // Placeholder for POST /ai/suggestions/{id}/accept — same interaction
    // contract as the real AI service (confirm → apply → feedback).
    setSuggestionState("accepted");
    toast.show({ message: "Noted — your day is adjusted" });
  }, [toast]);

  const handleDismissSuggestion = useCallback(() => {
    // Placeholder for POST /ai/suggestions/{id}/dismiss (writes AI memory).
    setSuggestionState("dismissed");
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.bg.canvas }]}>
      <TodayHeader
        name="Priya"
        onPressAvatar={() => router.push("/more")}
        onPressBell={() => {}}
      />

      {offline ? (
        <View
          style={[
            styles.offlineBanner,
            { backgroundColor: theme.colors.info.subtleBg },
          ]}
        >
          <Feather name="cloud-off" size={14} color={theme.colors.info.default} />
          <Text style={[theme.type.labelSm, { color: theme.colors.info.default }]}>
            Offline — changes will sync
          </Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.default}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {suggestion && suggestionState === "pending" ? (
          <SuggestionCard
            suggestion={suggestion}
            onAccept={handleAcceptSuggestion}
            onDismiss={handleDismissSuggestion}
          />
        ) : null}

        <TasksCard
          tasks={tasksData.data}
          loading={tasksData.loading}
          error={tasksData.error}
          offline={tasksData.offline}
          onToggle={handleToggleTask}
          onRetry={tasksData.refetch}
          onSeeAll={() => router.push("/tasks")}
        />

        <HealthCard snapshot={health} onOpen={() => router.push("/health")} />

        <WaterCard
          totalMl={waterTotal}
          loading={waterData.loading}
          error={waterData.error}
          offline={waterData.offline}
          onAdd={handleAddWater}
          onRetry={waterData.refetch}
          onOpen={() => router.push("/health")}
        />

        <SocialCard snapshot={social} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  feed: {
    paddingHorizontal: 16, // layout.margin
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16, // space.md between cards
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
