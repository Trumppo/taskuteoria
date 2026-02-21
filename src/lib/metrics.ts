import type { ProgressData } from "./progress";

export type SummaryMetrics = {
  noteAccuracyPercent: number;
  rhythmAccuracyPercent: number;
  listeningAccuracyPercent: number;
  keyAccuracyPercent: number;
  totalNoteAnswers: number;
  totalRhythmAnswers: number;
  totalListeningAnswers: number;
  totalKeyAnswers: number;
  weakestArea: string;
};

export function buildSummary(progress: ProgressData): SummaryMetrics {
  const noteTotal = progress.stats.noteTotal;
  const noteOk = progress.stats.noteCorrect;
  const rhythmTotal = progress.stats.rhythmTotal;
  const rhythmOk = progress.stats.rhythmCorrect;
  const listeningTotal = progress.stats.listeningTotal;
  const listeningOk = progress.stats.listeningCorrect;
  const keyTotal = progress.stats.keyTotal;
  const keyOk = progress.stats.keyCorrect;

  const noteAccuracyPercent = noteTotal > 0 ? Math.round((noteOk / noteTotal) * 100) : 0;
  const rhythmAccuracyPercent = rhythmTotal > 0 ? Math.round((rhythmOk / rhythmTotal) * 100) : 0;
  const listeningAccuracyPercent = listeningTotal > 0 ? Math.round((listeningOk / listeningTotal) * 100) : 0;
  const keyAccuracyPercent = keyTotal > 0 ? Math.round((keyOk / keyTotal) * 100) : 0;

  const weakestArea = (() => {
    const totalAnswers = noteTotal + rhythmTotal + listeningTotal + keyTotal;
    if (totalAnswers < 10) return "Ei tarpeeksi dataa";

    const pairs = [
      { area: "Nuottitunnistus", value: noteAccuracyPercent },
      { area: "Rytmi", value: rhythmAccuracyPercent },
      { area: "Kuuntelu", value: listeningAccuracyPercent },
      { area: "Savellajit", value: keyAccuracyPercent },
    ];
    pairs.sort((a, b) => a.value - b.value);
    return pairs[0].area;
  })();

  return {
    noteAccuracyPercent,
    rhythmAccuracyPercent,
    listeningAccuracyPercent,
    keyAccuracyPercent,
    totalNoteAnswers: noteTotal,
    totalRhythmAnswers: rhythmTotal,
    totalListeningAnswers: listeningTotal,
    totalKeyAnswers: keyTotal,
    weakestArea,
  };
}
