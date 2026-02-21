import { playMetronome, setMasterGain } from "../audio/synth";
import { addPracticeMinutes, registerSession, saveProgress } from "../progress";
import { loadSettings } from "../settings";

type RhythmPiece = { id: string; label: string; beats: number };
type TimeSignature = { id: "4/4" | "3/4" | "6/8"; label: string; targetBeats: number };
type RhythmDeck = { pieces: RhythmPiece[]; timeSignatures: TimeSignature[] };

export type RytmiData = {
  rhythmDeck: RhythmDeck;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initRytmi(data: RytmiData): void {
  const settings = loadSettings();
  setMasterGain(settings.masterGain);

  const statsEl = getRequiredElement<HTMLElement>("stats");
  const rhythmSigEl = getRequiredElement<HTMLElement>("rhythm-sig");
  const rhythmStatusEl = getRequiredElement<HTMLElement>("rhythm-status");
  const rhythmStartBtn = getRequiredElement<HTMLButtonElement>("rhythm-start");
  const rhythmTapBtn = getRequiredElement<HTMLButtonElement>("rhythm-tap");
  const rhythmStopBtn = getRequiredElement<HTMLButtonElement>("rhythm-stop");
  const rhythmNextBtn = getRequiredElement<HTMLButtonElement>("rhythm-next");
  const rhythmPaletteEl = getRequiredElement<HTMLElement>("rhythm-palette");
  const rhythmDropzoneEl = getRequiredElement<HTMLElement>("rhythm-dropzone");
  const rhythmDdStatusEl = getRequiredElement<HTMLElement>("rhythm-dd-status");
  const rhythmDdCheckBtn = getRequiredElement<HTMLButtonElement>("rhythm-dd-check");
  const rhythmDdRemoveBtn = getRequiredElement<HTMLButtonElement>("rhythm-dd-remove");
  const rhythmDdResetBtn = getRequiredElement<HTMLButtonElement>("rhythm-dd-reset");

  let progress = registerSession();
  let stopMetro: (() => void) | null = null;
  let rhythmRunning = false;
  let startAt = 0;
  let expectedTimes: number[] = [];
  let taps: number[] = [];
  let draggedPieceId: string | null = null;
  let measure: RhythmPiece[] = [];
  let currentSig = data.rhythmDeck.timeSignatures[0];

  function renderStats() {
    const rhythmRatio = progress.stats.rhythmTotal
      ? Math.round((progress.stats.rhythmCorrect / progress.stats.rhythmTotal) * 100)
      : 0;
    statsEl.textContent = `Rytmi: ${progress.stats.rhythmCorrect}/${progress.stats.rhythmTotal} (${rhythmRatio} %) | Putki: ${progress.streak}`;
  }

  function beatsInMeasure() {
    return measure.reduce((sum, piece) => sum + Number(piece.beats), 0);
  }

  function pickTimeSignature() {
    currentSig = data.rhythmDeck.timeSignatures[Math.floor(Math.random() * data.rhythmDeck.timeSignatures.length)];
    rhythmSigEl.textContent = `Tahtilaji: ${currentSig.label}`;
    rhythmDdStatusEl.textContent = `Tahti: ${beatsInMeasure()} / ${currentSig.targetBeats} iskua`;
  }

  function resetRhythmUi() {
    rhythmTapBtn.disabled = true;
    rhythmStopBtn.disabled = true;
    rhythmStartBtn.disabled = false;
    rhythmRunning = false;
    if (stopMetro) stopMetro();
    stopMetro = null;
  }

  function finishRhythm() {
    if (!rhythmRunning) return;
    const count = Math.min(taps.length, expectedTimes.length);
    const offsets: number[] = [];
    for (let i = 0; i < count; i += 1) {
      offsets.push(Math.abs(taps[i] - expectedTimes[i]));
    }
    const average = offsets.length
      ? Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length)
      : 999;

    const isCorrect = count === currentSig.targetBeats && offsets.every((v) => v <= 150);
    progress.stats.rhythmTotal += 1;
    if (isCorrect) progress.stats.rhythmCorrect += 1;
    saveProgress(progress);
    progress = addPracticeMinutes(0.75);
    renderStats();

    rhythmStatusEl.textContent = isCorrect
      ? `Hyva! ${currentSig.label} osui hyvin (keskipoikkeama ${average} ms).`
      : `Yrita uudelleen. ${currentSig.label}, keskipoikkeama ${average} ms.`;
    resetRhythmUi();
  }

  rhythmStartBtn.addEventListener("click", () => {
    const beatMs = 60000 / settings.metronomeBpm;
    startAt = performance.now() + beatMs;
    expectedTimes = Array.from({ length: currentSig.targetBeats }, (_, i) => startAt + i * beatMs);
    taps = [];
    rhythmRunning = true;
    rhythmStatusEl.textContent = `Naputa ${currentSig.targetBeats} iskua (${currentSig.label}, ${settings.metronomeBpm} BPM).`;
    rhythmTapBtn.disabled = false;
    rhythmStopBtn.disabled = false;
    rhythmStartBtn.disabled = true;
    if (stopMetro) stopMetro();
    stopMetro = playMetronome(settings.metronomeBpm, currentSig.id);
    window.setTimeout(() => {
      if (rhythmRunning) finishRhythm();
    }, beatMs * (currentSig.targetBeats + 1));
  });

  rhythmTapBtn.addEventListener("click", () => {
    if (!rhythmRunning) return;
    taps.push(performance.now());
    if (taps.length >= currentSig.targetBeats) finishRhythm();
  });

  rhythmStopBtn.addEventListener("click", () => {
    rhythmStatusEl.textContent = "Rytmiharjoitus keskeytetty.";
    resetRhythmUi();
  });

  rhythmNextBtn.addEventListener("click", () => {
    pickTimeSignature();
    rhythmStatusEl.textContent = "Uusi tahtilaji arvottu.";
  });

  function renderMeasure() {
    rhythmDropzoneEl.innerHTML = "";
    measure.forEach((piece, index) => {
      const chip = document.createElement("div");
      chip.className = "dropchip";
      chip.textContent = `${piece.label} (${piece.beats})`;
      chip.title = "Napauta poistaaksesi";
      chip.addEventListener("click", () => {
        measure.splice(index, 1);
        renderMeasure();
      });
      rhythmDropzoneEl.appendChild(chip);
    });
    rhythmDdStatusEl.textContent = `Tahti: ${beatsInMeasure()} / ${currentSig.targetBeats} iskua`;
  }

  data.rhythmDeck.pieces.forEach((piece) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost";
    btn.textContent = `${piece.label} (${piece.beats})`;
    btn.draggable = true;
    btn.addEventListener("dragstart", () => {
      draggedPieceId = piece.id;
    });
    btn.addEventListener("click", () => {
      measure.push(piece);
      renderMeasure();
    });
    rhythmPaletteEl.appendChild(btn);
  });

  rhythmDropzoneEl.addEventListener("dragover", (event) => {
    event.preventDefault();
    rhythmDropzoneEl.classList.add("is-over");
  });

  rhythmDropzoneEl.addEventListener("dragleave", () => {
    rhythmDropzoneEl.classList.remove("is-over");
  });

  rhythmDropzoneEl.addEventListener("drop", (event) => {
    event.preventDefault();
    rhythmDropzoneEl.classList.remove("is-over");
    if (!draggedPieceId) return;
    const piece = data.rhythmDeck.pieces.find((p) => p.id === draggedPieceId);
    if (!piece) return;
    measure.push(piece);
    renderMeasure();
  });

  rhythmDdCheckBtn.addEventListener("click", () => {
    const total = beatsInMeasure();
    const ok = total === currentSig.targetBeats;
    progress.stats.rhythmTotal += 1;
    if (ok) progress.stats.rhythmCorrect += 1;
    saveProgress(progress);
    progress = addPracticeMinutes(0.5);
    renderStats();
    rhythmDdStatusEl.textContent = ok
      ? `Oikein! ${currentSig.label} tayttyi tarkasti (${total}/${currentSig.targetBeats}).`
      : `Ei viela oikein (${total}/${currentSig.targetBeats}). Kokeile uudelleen.`;
  });

  rhythmDdResetBtn.addEventListener("click", () => {
    measure = [];
    renderMeasure();
  });

  rhythmDdRemoveBtn.addEventListener("click", () => {
    if (measure.length === 0) return;
    measure.pop();
    renderMeasure();
  });

  pickTimeSignature();
  renderStats();
  renderMeasure();
}
