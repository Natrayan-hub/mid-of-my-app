// S6 — Today dashboard (stub). The at-a-glance home lands here next phase.
import React from "react";

import { StubScreen } from "@/src/components/StubScreen";

export default function TodayScreen() {
  return (
    <StubScreen
      title="Today"
      icon="sun"
      description="Your at-a-glance command center — calendar, tasks, health, and AI suggestions land here."
      actions={[{ icon: "bell", onPress: () => {}, accessibilityLabel: "Notifications" }]}
    />
  );
}
