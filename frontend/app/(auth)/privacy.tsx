// S3 (privacy-first ordering) — "Your data, your rules": per-domain
// local-vs-cloud defaults, persisted to Preference.data_controls (S34 model).
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { api, ApiError } from "@/src/api/client";
import { OnboardingScaffold } from "@/src/features/onboarding/OnboardingScaffold";
import { useTheme } from "@/src/theme";
import type { DataControls, Preference } from "@/src/types/models";

interface DomainRow {
  key: keyof DataControls;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  cloudNote: string;
  localNote: string;
  defaultCloud: boolean;
}

const DOMAINS: DomainRow[] = [
  {
    key: "tasks", icon: "check-circle", title: "Tasks",
    cloudNote: "Synced — restore on a new device",
    localNote: "This device only — lost if you lose it",
    defaultCloud: true,
  },
  {
    key: "documents", icon: "file-text", title: "Documents",
    cloudNote: "Encrypted cloud backup + search",
    localNote: "This device only",
    defaultCloud: true,
  },
  {
    key: "health_cache", icon: "heart", title: "Health data",
    cloudNote: "Synced for cross-device insights",
    localNote: "Never leaves your device (recommended)",
    defaultCloud: false,
  },
  {
    key: "ai_memory", icon: "zap", title: "AI memory",
    cloudNote: "Synced — suggestions follow you",
    localNote: "This device only",
    defaultCloud: true,
  },
];

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [cloud, setCloud] = useState<Record<string, boolean>>(
    Object.fromEntries(DOMAINS.map((d) => [d.key, d.defaultCloud])),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const pref = await api.get<Preference>("/me/preferences");
      const data_controls: DataControls = {
        ...pref.data_controls,
        tasks: cloud.tasks ? "cloud" : "local",
        documents: cloud.documents ? "cloud" : "local",
        health_cache: cloud.health_cache ? "cloud" : "local",
        ai_memory: cloud.ai_memory ? "cloud" : "local",
      };
      await api.put<Preference>("/me/preferences", { ...pref, data_controls });
      router.push("/(auth)/permissions");
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === "NETWORK_ERROR"
          ? "You're offline — we'll need a connection to save this."
          : "Couldn't save — please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScaffold
      step={2}
      title="Your data, your rules"
      subtitle="Choose what syncs to encrypted cloud and what stays only on this device. Change any of this later in the Privacy Center."
      primaryLabel="Save & continue"
      onPrimary={save}
      loading={loading}
    >
      <View style={{ gap: theme.space.sm }}>
        {error ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: theme.colors.error.subtleBg, borderRadius: theme.radius.sm },
            ]}
          >
            <Text style={[theme.type.bodySm, { color: theme.colors.error.text }]}>{error}</Text>
          </View>
        ) : null}

        {DOMAINS.map((domain) => {
          const isCloud = cloud[domain.key];
          return (
            <View
              key={domain.key}
              style={[
                styles.row,
                theme.elevation.e1,
                { backgroundColor: theme.colors.surface.default, borderRadius: theme.radius.md },
              ]}
            >
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: theme.colors.surface.primarySubtle, borderRadius: theme.radius.xs },
                ]}
              >
                <Feather name={domain.icon} size={20} color={theme.colors.primary.subtleText} />
              </View>
              <View style={styles.rowText}>
                <Text style={[theme.type.h4, { color: theme.colors.text.primary }]}>
                  {domain.title}
                </Text>
                <View style={styles.noteRow}>
                  <Feather
                    name={isCloud ? "cloud" : "smartphone"}
                    size={12}
                    color={isCloud ? theme.colors.privacy.cloud : theme.colors.privacy.local}
                  />
                  <Text
                    style={[
                      theme.type.caption,
                      styles.flex,
                      { color: isCloud ? theme.colors.privacy.cloud : theme.colors.privacy.local },
                    ]}
                  >
                    {isCloud ? domain.cloudNote : domain.localNote}
                  </Text>
                </View>
              </View>
              <Switch
                value={isCloud}
                onValueChange={(v) => setCloud((c) => ({ ...c, [domain.key]: v }))}
                trackColor={{
                  false: theme.colors.border.strong,
                  true: theme.colors.primary.default,
                }}
                thumbColor="#FFFFFF"
                accessibilityLabel={`Sync ${domain.title} to cloud`}
              />
            </View>
          );
        })}

        <Text style={[theme.type.caption, { color: theme.colors.text.tertiary, marginTop: theme.space.xs }]}>
          Everything synced is encrypted in transit and at rest. We never sell data or show ads.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: 2 },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  flex: { flex: 1 },
  errorBanner: { padding: 12 },
});
