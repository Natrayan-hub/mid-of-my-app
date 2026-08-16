// Onboarding flow stack (S1–S5). Entry: welcome.
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
