import { beforeEach, describe, expect, it } from "vitest";
import { addPracticeMinutes, loadProgress, registerSession, saveProgress } from "./progress";

describe("progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with defaults", () => {
    const data = loadProgress();
    expect(data.streak).toBe(0);
    expect(data.todayMinutes).toBe(0);
  });

  it("registers daily streak once per day", () => {
    const first = registerSession();
    const second = registerSession();
    expect(first.streak).toBe(1);
    expect(second.streak).toBe(1);
  });

  it("adds practice minutes and total minutes", () => {
    const updated = addPracticeMinutes(1.25);
    expect(updated.todayMinutes).toBeCloseTo(1.25, 2);
    expect(updated.totalMinutes).toBeCloseTo(1.25, 2);
  });

  it("resets today bucket on date change", () => {
    const data = loadProgress();
    data.todayDate = "2000-01-01";
    data.todayMinutes = 12;
    saveProgress(data);
    const updated = addPracticeMinutes(0.5);
    expect(updated.todayDate).not.toBe("2000-01-01");
    expect(updated.todayMinutes).toBeCloseTo(0.5, 2);
  });
});

