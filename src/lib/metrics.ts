import type { ProgressData } from "./progress";

export type SummaryMetrics = {
  noteAccuracyPercent: number;
  rhythmAccuracyPercent: number;
  totalNoteAnswers: number;
  totalRhythmAnswers: number;
  weakestArea: string;
};

export function buildSummary(progress: ProgressData): SummaryMetrics {
  const noteTotal = progress.stats.noteTotal;
  const noteOk = progress.stats.noteCorrect;
  const rhythmTotal = progress.stats.rhythmTotal;
  const rhythmOk = progress.stats.rhythmCorrect;

  const noteAccuracyPercent = noteTotal > 0 ? Math.round((noteOk / noteTotal) * 100) : 0;
  const rhythmAccuracyPercent = rhythmTotal > 0 ? Math.round((rhythmOk / rhythmTotal) * 100) : 0;

  const weakestArea = (() => {
    if (noteTotal + rhythmTotal < 10) return "Ei tarpeeksi dataa";
    if (noteAccuracyPercent <= rhythmAccuracyPercent) return "Nuottitunnistus";
    return "Rytmi";
  })();

  return {
    noteAccuracyPercent,
    rhythmAccuracyPercent,
    totalNoteAnswers: noteTotal,
    totalRhythmAnswers: rhythmTotal,
    weakestArea,
  };
}
