import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db as firestoreDb } from "../config/firebase/firebaseConfig";
import { getPendingTasks, markAsSynced } from "../db/taskRepository";
import { Task, TaskStatus } from "../types";

export interface FirestoreTask {
  firestoreId: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: TaskStatus;
}

function userTasksCol(uid: string) {
  return collection(firestoreDb, "users", uid, "tasks");
}

function userTaskDoc(uid: string, firestoreId: string) {
  return doc(firestoreDb, "users", uid, "tasks", firestoreId);
}

/**
 * Tek bir task'ı Firestore'a yazar (oluşturur ya da günceller).
 * Yeni bir Firestore doc oluşturulursa oluşturulan ID'yi döner.
 */
export async function pushTaskToFirestore(
  task: Task,
  uid: string
): Promise<string> {
  const payload = {
    localId: task.id,
    title: task.title,
    description: task.description,
    lat: task.lat,
    lng: task.lng,
    status: task.status,
    updatedAt: serverTimestamp(),
  };

  if (task.firestoreId) {
    await updateDoc(userTaskDoc(uid, task.firestoreId), payload);
    return task.firestoreId;
  }

  const ref = await addDoc(userTasksCol(uid), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Firestore'dan task siler. firestoreId yoksa işlem yapmaz.
 */
export async function deleteTaskFromFirestore(
  firestoreId: string | null | undefined,
  uid: string
): Promise<void> {
  if (!firestoreId) return;
  await deleteDoc(userTaskDoc(uid, firestoreId));
}

/**
 * Firestore'daki kullanıcıya ait tüm task'ları getirir.
 */
export async function fetchTasksFromFirestore(uid: string): Promise<FirestoreTask[]> {
  const snapshot = await getDocs(userTasksCol(uid));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      firestoreId: docSnap.id,
      title: data.title ?? "",
      description: data.description ?? "",
      lat: data.lat ?? 0,
      lng: data.lng ?? 0,
      status: (data.status as TaskStatus) ?? "draft",
    };
  });
}

/**
 * SQLite'ta needs_sync = 1 olan tüm task'ları Firestore'a gönderir.
 * Başarılı olanlar için SQLite'ta needs_sync = 0 ve firestore_id güncellenir.
 * @returns Başarıyla senkronize edilen task sayısı
 */
export async function syncAllPending(uid: string): Promise<number> {
  const pending = await getPendingTasks();
  if (pending.length === 0) return 0;

  let count = 0;
  for (const task of pending) {
    try {
      const firestoreId = await pushTaskToFirestore(task, uid);
      await markAsSynced(task.id, firestoreId);
      count++;
    } catch {
      // Bağlantı yoksa veya hata olursa sessizce geç; bir sonraki fırsatta tekrar denenecek
    }
  }
  return count;
}
