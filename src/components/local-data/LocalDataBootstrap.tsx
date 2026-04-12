"use client";

import { useEffect } from "react";
import { migrateLegacyPromoLocalStorageOnce, registerOutboxOnlineListener } from "@/lib/local-db/outbox-sync";

/** Inicializa SQLite (lazy), migración LS→SQLite y listener de outbox. */
export function LocalDataBootstrap() {
  useEffect(() => {
    void migrateLegacyPromoLocalStorageOnce();
    return registerOutboxOnlineListener();
  }, []);
  return null;
}
