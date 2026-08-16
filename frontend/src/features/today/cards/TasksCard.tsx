// Tasks-due-today card — REAL data (GET /api/tasks?bucket=today), top 3 by
// priority, inline optimistic completion with Undo, per-card error/empty/
// loading states. Header → Tasks tab (S10 stub).
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card, CardError, CardHeader } from "@/src/components/Card";
import { Skeleton } from "@/src/components/Skeleton";
import { useTheme } from "@/src/theme";
import type { Task } from "@/src/types/models";

const MAX_VISIBLE = 3;

interface TasksCardProps {
  tasks: Task[] | null;
  loading: boolean;
  error: string | null;
  offline: boolean;
  onToggle: (task: Task) => void;
  onRetry: () => void;
  onSeeAll: () => void;
}

export function TasksCard({
  tasks, loading, error, offline, onToggle, onRetry, onSeeAll,
}: TasksCardProps) {
  const { theme } = useTheme();

  const open = (tasks ?? []).filter((t) => !t.completed_at);
  const doneCount = (tasks ?? []).filter((t) => t.completed_at).length;
  const visible = open.slice(0, MAX_VISIBLE);

  return (
    <Card>
      <CardHeader
        icon={<Feather name="check-circle" size={16} color={theme.colors.primary.default} />}
        label="Tasks"
        onSeeAll={onSeeAll}
      />

      {loading ? (
        <View style={{ gap: theme.space.sm }}>
          <Skeleton height={20} width="90%" />
          <Skeleton height={20} width="75%" />
          <Skeleton height={20} width="60%" />
        </View>
      ) : error ? (
        <CardError message={error} onRetry={onRetry} />
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[theme.type.body, { color: theme.colors.text.primary }]}>
            Nothing left for today 🎉
          </Text>
          <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
            {doneCount > 0 ? `${doneCount} completed — nice work.` : "Add a task with the + button."}
          </Text>
        </View>
      ) : (
        <View>
          {visible.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => onToggle(task)}
              accessibilityRole="checkbox"
              accessibilityLabel={`Complete task: ${task.title}`}
              accessibilityState={{ checked: false }}
              style={styles.taskRow}
            >
              <View style={[styles.checkbox, { borderColor: theme.colors.border.strong }]} />
              <Text
                style={[theme.type.h4, styles.taskTitle, { color: theme.colors.text.primary }]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.priority >= 2 ? (
                <Feather name="flag" size={14} color={theme.colors.warning.default} />
              ) : null}
            </TouchableOpacity>
          ))}
          <View style={styles.footerRow}>
            {open.length > MAX_VISIBLE ? (
              <Text style={[theme.type.caption, { color: theme.colors.text.secondary }]}>
                {`+${open.length - MAX_VISIBLE} more today`}
              </Text>
            ) : <View />}
            {doneCount > 0 ? (
              <Text style={[theme.type.caption, { color: theme.colors.success.text }]}>
                {`${doneCount} done`}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {offline ? (
        <Text style={[theme.type.caption, { color: theme.colors.text.tertiary, marginTop: theme.space.xs }]}>
          Offline — showing last synced tasks
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
  },
  taskTitle: { flex: 1 },
  empty: { gap: 4, paddingVertical: 4 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
});
