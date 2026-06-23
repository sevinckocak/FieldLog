import { useEffect } from "react";
import { AppState } from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { syncPendingTasksAsync } from "../store/slices/taskSlice";
import { selectUser } from "../store/slices/authSlice";

/**
 * Kullanıcı giriş yapmışsa:
 * - Bileşen mount edildiğinde bekleyen task'ları Firestore'a gönderir.
 * - Uygulama arka plandan ön plana geldiğinde tekrar dener.
 */
export function useSyncOnResume() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (!user) return;

    dispatch(syncPendingTasksAsync());

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        dispatch(syncPendingTasksAsync());
      }
    });

    return () => sub.remove();
  }, [user, dispatch]);
}
