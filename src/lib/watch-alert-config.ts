export type WatchAlertsConfig = {
  enabled: boolean;
  alertMatchTime: boolean;
  changeInterval: "5" | "8" | "half";
  vibrateOnPeriod: boolean;
  vibrateIntensity: number;
  syncSubs: boolean;
  fatigueThreshold: number;
  updatedAt: number;
};

const WATCH_ALERTS_CONFIG_PREFIX = "synq_watch_alerts_config_v1";

function safeKeyPart(v: string): string {
  return String(v || "")
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function watchAlertsConfigKey(scope: {
  clubId: string;
  mode: "match" | "training";
  teamId?: string;
  mcc?: string;
  session?: string;
}): string {
  const club = safeKeyPart(scope.clubId || "global-hq");
  const mode = safeKeyPart(scope.mode || "match");
  const team = safeKeyPart(scope.teamId || "team_unknown");
  const mcc = safeKeyPart(scope.mcc || "mcc_unknown");
  const session = safeKeyPart(scope.session || "session_unknown");
  return [WATCH_ALERTS_CONFIG_PREFIX, club, mode, team, mcc, session].join("__");
}

export function defaultWatchAlertsConfig(): WatchAlertsConfig {
  return {
    enabled: true,
    alertMatchTime: true,
    changeInterval: "5",
    vibrateOnPeriod: true,
    vibrateIntensity: 70,
    syncSubs: true,
    fatigueThreshold: 20,
    updatedAt: Date.now(),
  };
}

export function readWatchAlertsConfig(
  scope: Parameters<typeof watchAlertsConfigKey>[0],
): WatchAlertsConfig {
  if (typeof window === "undefined") return defaultWatchAlertsConfig();
  try {
    const key = watchAlertsConfigKey(scope);
    const raw = localStorage.getItem(key);
    if (!raw) return defaultWatchAlertsConfig();
    const parsed = JSON.parse(raw) as Partial<WatchAlertsConfig>;
    if (!parsed || typeof parsed !== "object") return defaultWatchAlertsConfig();
    const defaults = defaultWatchAlertsConfig();
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : defaults.enabled,
      alertMatchTime:
        typeof parsed.alertMatchTime === "boolean" ? parsed.alertMatchTime : defaults.alertMatchTime,
      changeInterval:
        parsed.changeInterval === "5" || parsed.changeInterval === "8" || parsed.changeInterval === "half"
          ? parsed.changeInterval
          : defaults.changeInterval,
      vibrateOnPeriod:
        typeof parsed.vibrateOnPeriod === "boolean" ? parsed.vibrateOnPeriod : defaults.vibrateOnPeriod,
      vibrateIntensity:
        Number.isFinite(Number(parsed.vibrateIntensity))
          ? Math.max(0, Math.min(100, Number(parsed.vibrateIntensity)))
          : defaults.vibrateIntensity,
      syncSubs: typeof parsed.syncSubs === "boolean" ? parsed.syncSubs : defaults.syncSubs,
      fatigueThreshold:
        Number.isFinite(Number(parsed.fatigueThreshold))
          ? Math.max(5, Math.min(90, Number(parsed.fatigueThreshold)))
          : defaults.fatigueThreshold,
      updatedAt: Number.isFinite(Number(parsed.updatedAt)) ? Number(parsed.updatedAt) : defaults.updatedAt,
    };
  } catch {
    return defaultWatchAlertsConfig();
  }
}

export function writeWatchAlertsConfig(
  scope: Parameters<typeof watchAlertsConfigKey>[0],
  next: Omit<WatchAlertsConfig, "updatedAt">,
): WatchAlertsConfig {
  const payload: WatchAlertsConfig = { ...next, updatedAt: Date.now() };
  if (typeof window === "undefined") return payload;
  try {
    localStorage.setItem(watchAlertsConfigKey(scope), JSON.stringify(payload));
  } catch {
    // noop
  }
  return payload;
}
