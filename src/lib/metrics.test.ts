import { describe, expect, it } from "vitest";
import { buildSummary } from "./metrics";
import type { ProgressData } from "./progress";

function makeProgress(overrides: Partial<ProgressData["stats"]>): ProgressData {
  return {
    streak: 1,
    lastPracticeDate: "2026-02-21",
    todayDate: "2026-02-21",
    todayMinutes: 2,
    totalMinutes: 10,
    completedLessons: [],
    stats: {
      noteCorrect: 0,
      noteTotal: 0,
      rhythmCorrect: 0,
      rhythmTotal: 0,
      listeningCorrect: 0,
      listeningTotal: 0,
      ...overrides,
    },
  };
}

describe("metrics", () => {
  it("returns no-data weakest area for small dataset", () => {
    const summary = buildSummary(makeProgress({ noteCorrect: 1, noteTotal: 2 }));
    expect(summary.weakestArea).toBe("Ei tarpeeksi dataa");
  });

  it("finds weakest area from three categories", () => {
    const summary = buildSummary(
      makeProgress({
        noteCorrect: 8,
        noteTotal: 10,
        rhythmCorrect: 3,
        rhythmTotal: 10,
        listeningCorrect: 6,
        listeningTotal: 10,
      }),
    );
    expect(summary.noteAccuracyPercent).toBe(80);
    expect(summary.rhythmAccuracyPercent).toBe(30);
    expect(summary.listeningAccuracyPercent).toBe(60);
    expect(summary.weakestArea).toBe("Rytmi");
  });
});

