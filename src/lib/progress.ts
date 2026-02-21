export type ProgressData = {
  streak: number;
  lastPracticeDate: string | null;
  todayDate: string | null;
  todayMinutes: number;
  totalMinutes: number;
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
  todayDate: null,
  todayMinutes: 0,
  totalMinutes: 0,
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

function ensureTodayBucket(data: ProgressData): ProgressData {
  const today = new Date().toISOString().slice(0, 10);
  if (data.todayDate !== today) {
    data.todayDate = today;
    data.todayMinutes = 0;
  }
  return data;
}

export function registerSession(): ProgressData {
  const current = loadProgress();
  ensureTodayBucket(current);
  const today = new Date().toISOString().slice(0, 10);
  if (current.lastPracticeDate !== today) {
    current.streak += 1;
    current.lastPracticeDate = today;
    saveProgress(current);
  }
  return current;
}

export function addPracticeMinutes(deltaMinutes: number): ProgressData {
  const current = loadProgress();
  ensureTodayBucket(current);
  const delta = Math.max(0, deltaMinutes);
  current.todayMinutes = Number((current.todayMinutes + delta).toFixed(2));
  current.totalMinutes = Number((current.totalMinutes + delta).toFixed(2));
  saveProgress(current);
  return current;
}

export function isDailyGoalMet(progress: ProgressData, goalMinutes: number): boolean {
  return progress.todayMinutes >= Math.max(1, goalMinutes);
}
