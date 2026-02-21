export type TimeSig = "4/4" | "3/4" | "6/8";

export type AppSettings = {
  masterGain: number;
  metronomeBpm: number;
  defaultTimeSig: TimeSig;
  dailyGoalMin: number;
};

const KEY = "taskuteoria_settings_v1";

const defaults: AppSettings = {
  masterGain: 0.18,
  metronomeBpm: 90,
  defaultTimeSig: "4/4",
  dailyGoalMin: 8,
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function normalize(input: Partial<AppSettings> | null | undefined): AppSettings {
  const base = { ...defaults, ...(input ?? {}) };
  return {
    masterGain: clamp(Number(base.masterGain || defaults.masterGain), 0.01, 0.8),
    metronomeBpm: Math.round(clamp(Number(base.metronomeBpm || defaults.metronomeBpm), 40, 220)),
    defaultTimeSig: (["4/4", "3/4", "6/8"].includes(base.defaultTimeSig) ? base.defaultTimeSig : defaults.defaultTimeSig) as TimeSig,
    dailyGoalMin: Math.round(clamp(Number(base.dailyGoalMin || defaults.dailyGoalMin), 3, 20)),
  };
}

export function loadSettings(): AppSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<AppSettings>;
    return normalize(parsed);
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(next: Partial<AppSettings>): AppSettings {
  const merged = normalize({ ...loadSettings(), ...next });
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export function resetSettings(): AppSettings {
  localStorage.removeItem(KEY);
  return { ...defaults };
}

