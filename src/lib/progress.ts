export type ProgressData = {
  streak: number;
  lastPracticeDate: string | null;
  completedLessons: string[];
  stats: {
    noteCorrect: number;
    noteTotal: number;
    rhythmCorrect: number;
    rhythmTotal: number;
    listeningCorrect: number;
    listeningTotal: number;
  };
};

const KEY = "taskuteoria_progress_v1";

const defaults: ProgressData = {
  streak: 0,
  lastPracticeDate: null,
  completedLessons: [],
  stats: {
    noteCorrect: 0,
    noteTotal: 0,
    rhythmCorrect: 0,
    rhythmTotal: 0,
    listeningCorrect: 0,
    listeningTotal: 0,
  },
};

export function loadProgress(): ProgressData {
  const raw = localStorage.getItem(KEY);
  if (!raw) return structuredClone(defaults);
  try {
    const parsed = JSON.parse(raw) as ProgressData;
    return { ...defaults, ...parsed, stats: { ...defaults.stats, ...parsed.stats } };
  } catch {
    return structuredClone(defaults);
  }
}

export function saveProgress(data: ProgressData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function registerSession(): ProgressData {
  const current = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  if (current.lastPracticeDate !== today) {
    current.streak += 1;
    current.lastPracticeDate = today;
    saveProgress(current);
  }
  return current;
}
