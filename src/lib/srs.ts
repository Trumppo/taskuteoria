export type SrsCard = {
  id: string;
  dueAt: number;
  intervalDays: number;
  ease: number;
};

const KEY = "taskuteoria_srs_v1";

export function loadSrs(): Record<string, SrsCard> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, SrsCard>;
  } catch {
    return {};
  }
}

export function buildSrsQueue(now = Date.now()): { due: SrsCard[]; upcoming: SrsCard[] } {
  const all = Object.values(loadSrs());
  const due = all.filter((card) => card.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
  const upcoming = all.filter((card) => card.dueAt > now).sort((a, b) => a.dueAt - b.dueAt);
  return { due, upcoming };
}

function saveSrs(data: Record<string, SrsCard>): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function reviewCard(id: string, knewIt: boolean): SrsCard {
  const all = loadSrs();
  const now = Date.now();
  const base = all[id] ?? { id, dueAt: now, intervalDays: 1, ease: 2.5 };

  if (knewIt) {
    const nextInterval = Math.max(1, Math.round(base.intervalDays * base.ease));
    base.intervalDays = nextInterval;
    base.ease = Math.min(3.0, base.ease + 0.15);
  } else {
    base.intervalDays = 1;
    base.ease = Math.max(1.3, base.ease - 0.2);
  }

  base.dueAt = now + base.intervalDays * 24 * 60 * 60 * 1000;
  all[id] = base;
  saveSrs(all);
  return base;
}
