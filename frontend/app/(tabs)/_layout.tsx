// Primary navigation (IA Part A): bottom tabs + global Quick-Add FAB.
// Tab order: Today · Tasks · [＋] · Health · Docs · More.
import { Tabs } from "expo-router";
import React, { useCallback, useState } from "react";

import { QuickAddSheet } from "@/src/components/QuickAddSheet";
import { TabBar } from "@/src/components/TabBar";

export default function TabsLayout() {
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  const openQuickAdd = useCallback(() => setQuickAddVisible(true), []);
  const closeQuickAdd = useCallback(() => setQuickAddVisible(false), []);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} onQuickAdd={openQuickAdd} />}
      >
        <Tabs.Screen name="index" options={{ title: "Today" }} />
        <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
        <Tabs.Screen name="health" options={{ title: "Health" }} />
        <Tabs.Screen name="docs" options={{ title: "Docs" }} />
        <Tabs.Screen name="more" options={{ title: "More" }} />
      </Tabs>
      <QuickAddSheet visible={quickAddVisible} onClose={closeQuickAdd} />
    </>
  );
}
