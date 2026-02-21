export type DayProgress = {
  lastStep: string;
  completed: string[];
  updatedAt: string;
};

type ProgressStore = Record<string, DayProgress>;

const KEY = "taskuteoria:polkuProgress";

export function loadPathProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

function savePathProgress(store: ProgressStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getDayProgress(dayId: string): DayProgress | null {
  const store = loadPathProgress();
  return store[dayId] ?? null;
}

export function markStepCompleted(dayId: string, stepKey: string): DayProgress {
  const store = loadPathProgress();
  const current = store[dayId] ?? { lastStep: stepKey, completed: [], updatedAt: "" };
  const completed = current.completed.includes(stepKey)
    ? current.completed
    : [...current.completed, stepKey];

  const next = {
    lastStep: stepKey,
    completed,
    updatedAt: new Date().toISOString(),
  };
  store[dayId] = next;
  savePathProgress(store);
  return next;
}
