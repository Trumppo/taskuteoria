export const LEVELS = [
  { value: "beginner", label: "Aloittelija" },
  { value: "intermediate", label: "Edistynyt" },
  { value: "expert", label: "Asiantuntija" },
] as const;

export type LevelValue = (typeof LEVELS)[number]["value"];

const DEFAULT_LEVEL: LevelValue = "beginner";
const LEVEL_KEY = "taskuteoria:level";

export function getLevel(): LevelValue {
  if (typeof localStorage === "undefined") return DEFAULT_LEVEL;
  const stored = localStorage.getItem(LEVEL_KEY);
  if (stored === "beginner" || stored === "intermediate" || stored === "expert") {
    return stored;
  }
  return DEFAULT_LEVEL;
}

export function setLevel(level: LevelValue): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LEVEL_KEY, level);
}

export function getLevelLabel(level: LevelValue = getLevel()): string {
  const match = LEVELS.find((item) => item.value === level);
  return match?.label ?? "Aloittelija";
}
