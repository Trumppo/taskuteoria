import { beforeEach, describe, expect, it } from "vitest";
import { loadSrs, reviewCard } from "./srs";

describe("srs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates and schedules a new card when known", () => {
    const result = reviewCard("card-a", true);
    expect(result.id).toBe("card-a");
    expect(result.intervalDays).toBeGreaterThanOrEqual(2);
    expect(result.ease).toBeGreaterThan(2.5);
    expect(result.dueAt).toBeGreaterThan(Date.now());
  });

  it("resets to one day interval when unknown", () => {
    reviewCard("card-b", true);
    const result = reviewCard("card-b", false);
    expect(result.intervalDays).toBe(1);
    expect(result.ease).toBeLessThanOrEqual(2.65);
  });

  it("persists cards to localStorage", () => {
    reviewCard("card-c", true);
    const all = loadSrs();
    expect(all["card-c"]).toBeDefined();
  });
});

