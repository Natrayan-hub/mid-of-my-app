// Toast/snackbar (Design System E.8): bottom, above tab bar, inverse surface,
// optional Undo action. One at a time; auto-dismiss 4s (8s with action).
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

interface ToastPayload {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  show: (toast: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(80)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }).start(
      () => setToast(null),
    );
  }, [translateY]);

  const show = useCallback(
    (payload: ToastPayload) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(payload);
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, payload.actionLabel ? 8000 : 4000);
    },
    [hide, translateY],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            theme.elevation.e2,
            {
              backgroundColor: theme.colors.surface.inverse,
              borderRadius: theme.radius.sm,
              bottom: theme.layout.tabBarHeight + insets.bottom + theme.space.md,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={[theme.type.bodySm, styles.message, { color: theme.colors.text.onInverse }]}>
            {toast.message}
          </Text>
          {toast.actionLabel ? (
            <TouchableOpacity
              onPress={() => {
                toast.onAction?.();
                hide();
              }}
              accessibilityRole="button"
              accessibilityLabel={toast.actionLabel}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[theme.type.label, { color: theme.colors.primary.default }]}>
                {toast.actionLabel}
              </Text>
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  message: { flex: 1 },
});
