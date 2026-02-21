export type TaskStat = {
  correct: number;
  total: number;
  lastSeen: string;
  lastResult: "ok" | "fail";
};

type StatsStore = Record<string, Record<string, TaskStat>>;
type CooldownStore = Record<string, string[]>;

const STATS_KEY = "taskuteoria:taskStats";
const COOLDOWN_KEY = "taskuteoria:taskCooldown";

function loadStatsStore(): StatsStore {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StatsStore;
  } catch {
    return {};
  }
}

function saveStatsStore(store: StatsStore): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(store));
}

function loadCooldownStore(): CooldownStore {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CooldownStore;
  } catch {
    return {};
  }
}

function saveCooldownStore(store: CooldownStore): void {
  localStorage.setItem(COOLDOWN_KEY, JSON.stringify(store));
}

export function recordResult(kind: string, taskId: string, ok: boolean): TaskStat {
  const store = loadStatsStore();
  const bucket = store[kind] ?? {};
  const current = bucket[taskId] ?? { correct: 0, total: 0, lastSeen: "", lastResult: "ok" };
  const next: TaskStat = {
    correct: current.correct + (ok ? 1 : 0),
    total: current.total + 1,
    lastSeen: new Date().toISOString(),
    lastResult: ok ? "ok" : "fail",
  };
  bucket[taskId] = next;
  store[kind] = bucket;
  saveStatsStore(store);
  return next;
}

export function markSeen(kind: string, taskId: string): void {
  const store = loadStatsStore();
  const bucket = store[kind] ?? {};
  const current = bucket[taskId];
  if (!current) {
    bucket[taskId] = { correct: 0, total: 0, lastSeen: new Date().toISOString(), lastResult: "ok" };
  } else {
    bucket[taskId] = { ...current, lastSeen: new Date().toISOString() };
  }
  store[kind] = bucket;
  saveStatsStore(store);
}

export function getCooldown(kind: string): string[] {
  const store = loadCooldownStore();
  return store[kind] ?? [];
}

export function updateCooldown(kind: string, taskId: string, windowSize: number): void {
  const store = loadCooldownStore();
  const current = store[kind] ?? [];
  const next = [taskId, ...current.filter((id) => id !== taskId)].slice(0, windowSize);
  store[kind] = next;
  saveCooldownStore(store);
}

function daysSince(iso: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const diff = Date.now() - Date.parse(iso);
  return diff / (1000 * 60 * 60 * 24);
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

type WeightedTask = {
  id: string;
  weight?: number;
};

export function pickTask<T extends WeightedTask>(
  kind: string,
  pool: T[],
  options: { cooldown: number; minSamples: number; recencyDays: number },
): T {
  const statsStore = loadStatsStore()[kind] ?? {};
  const history = getCooldown(kind);
  let candidates = pool.filter((task) => !history.includes(task.id));
  if (candidates.length === 0) candidates = pool;

  const weights = candidates.map((task) => {
    const stat = statsStore[task.id];
    const total = stat?.total ?? 0;
    const correct = stat?.correct ?? 0;
    const accuracy = total > 0 ? correct / total : 0;
    const failRate = 1 - accuracy;
    const dataWeight = Math.min(total / options.minSamples, 1);
    const recencyBoost = Math.min(daysSince(stat?.lastSeen ?? "") / options.recencyDays, 1);
    const baseWeight = 0.2;
    const score = failRate * dataWeight + recencyBoost * 0.2;
    return (task.weight ?? 1) * (baseWeight + score);
  });

  return weightedPick(candidates, weights);
}
