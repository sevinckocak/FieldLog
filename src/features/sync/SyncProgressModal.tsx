import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  resetSync,
  selectSyncDone,
  selectSyncFailed,
  selectSyncPhase,
  selectSyncTotal,
} from "../../store/slices/syncSlice";
import { fetchTasks } from "../../store/slices/taskSlice";

/**
 * Kullanıcıyı BLOKLAMAYAN sync bildirim bandı.
 * Modal değil, mutlak konumlu bir View — tüm dokunuşlar geçirgendir.
 */
export default function SyncProgressModal() {
  const { t } = useTranslation("common");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const dispatch = useAppDispatch();
  const phase = useAppSelector(selectSyncPhase);
  const total = useAppSelector(selectSyncTotal);
  const done = useAppSelector(selectSyncDone);
  const failed = useAppSelector(selectSyncFailed);

  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Sync başladığında veya success olduğunda bandı kaydır
  useEffect(() => {
    if (phase !== "idle") {
      slideAnim.setValue(80);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase]);

  // Success sonrası: listeyi yenile ve 2.5s sonra kapat
  useEffect(() => {
    if (phase === "success") {
      dispatch(fetchTasks({ force: true }));
      const timer = setTimeout(() => dispatch(resetSync()), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, dispatch]);

  // Idle'dayken render etme
  if (phase === "idle") return null;

  const pct = Math.round((done / Math.max(total, 1)) * 100);

  return (
    // pointerEvents="none" → tüm dokunuşlar arka plana geçer, uygulama kullanılabilir
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.positioner}>
        <Animated.View
          style={[
            styles.banner,
            {
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {phase === "syncing" && (
            <>
              <View style={styles.iconWrap}>
                <Ionicons name="cloud-upload-outline" size={18} color="#3B82F6" />
              </View>

              <View style={styles.content}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#F9FAFB" : "#111827" },
                  ]}
                  numberOfLines={1}
                >
                  {t("sync.syncing")}
                </Text>

                {/* Progress bar */}
                <View
                  style={[
                    styles.track,
                    { backgroundColor: isDark ? "#374151" : "#F3F4F6" },
                  ]}
                >
                  <View
                    style={[
                      styles.fill,
                      { width: `${pct}%` },
                    ]}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.counter,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {done}/{total}
              </Text>
            </>
          )}

          {phase === "success" && (
            <>
              <View style={styles.iconWrap}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              </View>

              <View style={styles.content}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#F9FAFB" : "#111827" },
                  ]}
                >
                  {t("sync.success")}
                </Text>
                <Text
                  style={[
                    styles.subText,
                    { color: isDark ? "#9CA3AF" : "#6B7280" },
                  ]}
                  numberOfLines={1}
                >
                  {t("sync.successCount", { count: done })}
                  {failed > 0
                    ? `  ·  ${t("sync.failedCount", { count: failed })}`
                    : ""}
                </Text>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    // Gölge (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // Yükseklik (Android)
    elevation: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 16,
  },
  subText: {
    fontSize: 11,
    lineHeight: 14,
  },
  track: {
    height: 3,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: 3,
    borderRadius: 99,
    backgroundColor: "#3B82F6",
  },
  counter: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "right",
  },
});
