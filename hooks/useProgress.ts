"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProgress } from "@/types";
import { getProgress } from "@/services/store";

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const refresh = useCallback(() => {
    setProgress(getProgress());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, refresh };
}
