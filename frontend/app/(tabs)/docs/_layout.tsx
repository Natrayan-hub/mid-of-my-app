// Docs tab stack — S18 home, S20 viewer, S21 category slot in here.
import { Stack } from "expo-router";
import React from "react";

export default function DocsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
