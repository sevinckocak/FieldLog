import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { syncPendingWithProgress } from "../store/slices/syncSlice";
import { selectUser } from "../store/slices/authSlice";

/**
 * Replaces useSyncOnResume. Triggers offline → online sync via NetInfo
 * and also syncs on app foreground resume.
 */
export function useNetworkSync(): void {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const uid = user?.uid;

  // Track previous connectivity to detect offline → online transition
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    if (!uid) return;

    // Sync on mount (covers first open and auth state changes)
    dispatch(syncPendingWithProgress(uid));

    // Re-sync whenever app returns to foreground
    const appSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        dispatch(syncPendingWithProgress(uid));
      }
    });

    // Sync only when transitioning from offline to online
    const netUnsub = NetInfo.addEventListener((netState) => {
      const isOnline =
        netState.isConnected === true &&
        netState.isInternetReachable !== false;

      if (isOnline && wasOnline.current === false) {
        dispatch(syncPendingWithProgress(uid));
      }
      wasOnline.current = isOnline;
    });

    return () => {
      appSub.remove();
      netUnsub();
    };
  }, [uid, dispatch]);
}
