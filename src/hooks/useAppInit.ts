import { useEffect, useState } from "react";
import { initDatabase } from "../db/client";

interface UseAppInitReturn {
  ready: boolean;
  error: string | null;
}

export function useAppInit(): UseAppInitReturn {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Veritabanı başlatılamadı");
      });
  }, []);

  return { ready, error };
}
