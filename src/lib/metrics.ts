import type { ProgressData } from "./progress";

export type SummaryMetrics = {
  noteAccuracyPercent: number;
  totalNoteAnswers: number;
  weakestArea: string;
};

export function buildSummary(progress: ProgressData): SummaryMetrics {
  const total = progress.stats.noteTotal;
  const ok = progress.stats.noteCorrect;
  const noteAccuracyPercent = total > 0 ? Math.round((ok / total) * 100) : 0;
  const weakestArea = total < 10 ? "Ei tarpeeksi dataa" : noteAccuracyPercent < 70 ? "Nuottitunnistus" : "Tasainen";
  return {
    noteAccuracyPercent,
    totalNoteAnswers: total,
    weakestArea,
  };
}

