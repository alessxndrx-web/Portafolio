"use client";

import { useEffect } from "react";
import { runStorageMigrations } from "@/lib/storage/migrations";

export function StorageMigrator() {
  useEffect(() => {
    runStorageMigrations();
  }, []);

  return null;
}
