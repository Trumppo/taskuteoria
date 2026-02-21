import { playInterval, playChord, playMetronome, setMasterGain } from "../audio/synth";
import { loadSettings } from "../settings";
import { addPracticeMinutes, loadProgress, registerSession, saveProgress } from "../progress";

type IntervalItem = { id: string; label: string; semitones: number };
type ChordItem = { id: string; label: string; quality: "major" | "minor" };
export type QuizData = { intervals: IntervalItem[]; chords: ChordItem[] };

type Task =
  | { kind: "interval"; value: IntervalItem }
  | { kind: "chord"; value: ChordItem };

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initKuuntele(data: QuizData): void {
  let stopMetro: (() => void) | null = null;
  let intervalMode: "melodic" | "harmonic" = "melodic";
  const settings = loadSettings();
  setMasterGain(settings.masterGain);
  let progress = registerSession();

  const promptEl = getRequiredElement<HTMLElement>("prompt");
  const feedbackEl = getRequiredElement<HTMLElement>("feedback");
  const modeEl = getRequiredElement<HTMLElement>("interval-mode");
  const statsEl = getRequiredElement<HTMLElement>("stats");
  const choicesEl = getRequiredElement<HTMLElement>("choices");
  const playTaskBtn = getRequiredElement<HTMLButtonElement>("play-task");
  const newTaskBtn = getRequiredElement<HTMLButtonElement>("new-task");
  const toggleIntervalBtn = getRequiredElement<HTMLButtonElement>("toggle-interval");
  const metroBtn = getRequiredElement<HTMLButtonElement>("metro");
  const stopBtn = getRequiredElement<HTMLButtonElement>("stop");

  const intervals = data.intervals;
  const chords = data.chords;

  let currentTask: Task | null = null;

  function renderStats() {
    const ratio = progress.stats.listeningTotal
      ? Math.round((progress.stats.listeningCorrect / progress.stats.listeningTotal) * 100)
      : 0;
    statsEl.textContent = `Kuuntelu: ${progress.stats.listeningCorrect}/${progress.stats.listeningTotal} (${ratio} %)`;
    modeEl.textContent = `Intervallitila: ${intervalMode === "melodic" ? "Melodinen" : "Harmoninen"}`;
  }

  function playCurrentTask() {
    if (!currentTask) return;
    if (currentTask.kind === "interval") {
      playInterval(60, currentTask.value.semitones, intervalMode === "harmonic");
    } else {
      playChord(60, currentTask.value.quality);
    }
  }

  function answer(selectedId: string) {
    if (!currentTask) return;
    const correct = selectedId === currentTask.value.id;
    progress = loadProgress();
    progress.stats.listeningTotal += 1;
    if (correct) progress.stats.listeningCorrect += 1;
    saveProgress(progress);
    progress = addPracticeMinutes(0.45);
    renderStats();
    feedbackEl.textContent = correct
      ? "Oikein!"
      : `Vaarin. Oikea vastaus: ${currentTask.value.label}.`;
    window.setTimeout(() => {
      nextTask();
      playCurrentTask();
    }, 700);
  }

  function nextTask() {
    const kind = Math.random() < 0.5 ? "interval" : "chord";
    if (kind === "interval") {
      currentTask = { kind, value: intervals[Math.floor(Math.random() * intervals.length)] };
      promptEl.textContent = "Tunnista intervalli";
      choicesEl.innerHTML = "";
      intervals.forEach((item) => {
        const b = document.createElement("button");
        b.className = "btn ghost";
        b.type = "button";
        b.textContent = item.label;
        b.addEventListener("click", () => answer(item.id));
        choicesEl.appendChild(b);
      });
    } else {
      currentTask = { kind, value: chords[Math.floor(Math.random() * chords.length)] };
      promptEl.textContent = "Tunnista sointu";
      choicesEl.innerHTML = "";
      chords.forEach((item) => {
        const b = document.createElement("button");
        b.className = "btn ghost";
        b.type = "button";
        b.textContent = item.label;
        b.addEventListener("click", () => answer(item.id));
        choicesEl.appendChild(b);
      });
    }
    feedbackEl.textContent = "Paina Soita tehtava ja valitse vastaus.";
  }

  playTaskBtn.addEventListener("click", () => playCurrentTask());
  newTaskBtn.addEventListener("click", () => nextTask());

  toggleIntervalBtn.addEventListener("click", () => {
    intervalMode = intervalMode === "melodic" ? "harmonic" : "melodic";
    renderStats();
  });

  metroBtn.addEventListener("click", () => {
    if (stopMetro) stopMetro();
    stopMetro = playMetronome(settings.metronomeBpm, settings.defaultTimeSig);
  });

  stopBtn.addEventListener("click", () => {
    if (stopMetro) stopMetro();
    stopMetro = null;
  });

  renderStats();
  nextTask();
}
