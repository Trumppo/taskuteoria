import { loadSettings, saveSettings, resetSettings } from "../settings";
import { setMasterGain, playNote } from "../audio/synth";

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initAsetukset(): void {
  const goalEl = getRequiredElement<HTMLInputElement>("goal");
  const bpmEl = getRequiredElement<HTMLInputElement>("bpm");
  const gainEl = getRequiredElement<HTMLInputElement>("gain");
  const goalVal = getRequiredElement<HTMLElement>("goal-value");
  const bpmVal = getRequiredElement<HTMLElement>("bpm-value");
  const gainVal = getRequiredElement<HTMLElement>("gain-value");
  const saveBtn = getRequiredElement<HTMLButtonElement>("save");
  const resetBtn = getRequiredElement<HTMLButtonElement>("reset-settings");

  function render(current: { dailyGoalMin: number; metronomeBpm: number; masterGain: number }) {
    goalEl.value = String(current.dailyGoalMin);
    bpmEl.value = String(current.metronomeBpm);
    gainEl.value = String(Math.round(current.masterGain * 100));
    goalVal.textContent = `${current.dailyGoalMin} min`;
    bpmVal.textContent = `${current.metronomeBpm} BPM`;
    gainVal.textContent = `${Math.round(current.masterGain * 100)} %`;
    setMasterGain(current.masterGain);
  }

  function draftFromInputs() {
    return {
      dailyGoalMin: Number(goalEl.value),
      metronomeBpm: Number(bpmEl.value),
      masterGain: Number(gainEl.value) / 100,
    };
  }

  [goalEl, bpmEl, gainEl].forEach((el) => {
    el.addEventListener("input", () => {
      const draft = draftFromInputs();
      goalVal.textContent = `${draft.dailyGoalMin} min`;
      bpmVal.textContent = `${draft.metronomeBpm} BPM`;
      gainVal.textContent = `${Math.round(draft.masterGain * 100)} %`;
      setMasterGain(draft.masterGain);
    });
  });

  saveBtn.addEventListener("click", () => {
    const next = saveSettings(draftFromInputs());
    render(next);
    playNote(72, 0.2);
  });

  resetBtn.addEventListener("click", () => {
    const next = resetSettings();
    render(next);
    playNote(67, 0.2);
  });

  render(loadSettings());
}
