import { playMetronome, playNote, setMasterGain } from "../audio/synth";
import { addPracticeMinutes, loadProgress, registerSession, saveProgress } from "../progress";
import { loadSettings } from "../settings";

type NoteItem = {
  answer: string;
  midi: number;
  clef: "treble" | "bass";
  staffPos: number;
};

type RhythmPiece = { id: string; label: string; beats: number };
type TimeSignature = { id: "4/4" | "3/4" | "6/8"; label: string; targetBeats: number };
type RhythmDeck = { pieces: RhythmPiece[]; timeSignatures: TimeSignature[] };

type KeyQuestion = { prompt: string; options: string[]; correctIndex: number };
type KeyDeck = { questions: KeyQuestion[] };

type HarjoitteleData = {
  notes: NoteItem[];
  rhythmDeck: RhythmDeck;
  keyDeck: KeyDeck;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initHarjoittele(data: HarjoitteleData): void {
  const settings = loadSettings();
  setMasterGain(settings.masterGain);

  const noteOptions = [...new Set(data.notes.map((note) => note.answer))];
  const targetEl = getRequiredElement<HTMLElement>("feedback");
  const clefEl = getRequiredElement<HTMLElement>("clef-label");
  const staffWrapEl = getRequiredElement<HTMLElement>("staff-wrap");
  const choicesEl = getRequiredElement<HTMLElement>("choices");
  const statsEl = getRequiredElement<HTMLElement>("stats");
  const playBtn = getRequiredElement<HTMLButtonElement>("play-btn");

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

  const keyQuestionEl = getRequiredElement<HTMLElement>("key-question");
  const keyOptionsEl = getRequiredElement<HTMLElement>("key-options");
  const keyFeedbackEl = getRequiredElement<HTMLElement>("key-feedback");
  const keyNextBtn = getRequiredElement<HTMLButtonElement>("key-next");

  let current = data.notes[Math.floor(Math.random() * data.notes.length)];
  let progress = registerSession();
  let stopMetro: (() => void) | null = null;
  let rhythmRunning = false;
  let startAt = 0;
  let expectedTimes: number[] = [];
  let taps: number[] = [];
  let draggedPieceId: string | null = null;
  let measure: RhythmPiece[] = [];
  let currentSig = data.rhythmDeck.timeSignatures[0];
  let keyQuestion = data.keyDeck.questions[0];

  function renderStaff(note: NoteItem) {
    staffWrapEl.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    const width = 260;
    const height = 130;
    const spacing = 12;
    const top = 26;
    const xLeft = 24;
    const xRight = width - 20;
    const noteX = 146;
    const staffBottomY = top + 4 * spacing;
    const noteY = staffBottomY - note.staffPos * (spacing / 2);

    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "staff-svg");

    for (let i = 0; i < 5; i += 1) {
      const line = document.createElementNS(ns, "line");
      const y = top + i * spacing;
      line.setAttribute("x1", String(xLeft));
      line.setAttribute("x2", String(xRight));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      line.setAttribute("stroke", "#1b1f23");
      line.setAttribute("stroke-width", "1.4");
      svg.appendChild(line);
    }

    if (note.staffPos <= -1) {
      const ledger = document.createElementNS(ns, "line");
      ledger.setAttribute("x1", String(noteX - 16));
      ledger.setAttribute("x2", String(noteX + 16));
      ledger.setAttribute("y1", String(staffBottomY + spacing));
      ledger.setAttribute("y2", String(staffBottomY + spacing));
      ledger.setAttribute("stroke", "#1b1f23");
      ledger.setAttribute("stroke-width", "1.2");
      svg.appendChild(ledger);
    }

    const noteHead = document.createElementNS(ns, "ellipse");
    noteHead.setAttribute("cx", String(noteX));
    noteHead.setAttribute("cy", String(noteY));
    noteHead.setAttribute("rx", "10");
    noteHead.setAttribute("ry", "7");
    noteHead.setAttribute("fill", "#0b6e4f");
    svg.appendChild(noteHead);

    const stem = document.createElementNS(ns, "line");
    stem.setAttribute("x1", String(noteX + 10));
    stem.setAttribute("x2", String(noteX + 10));
    stem.setAttribute("y1", String(noteY));
    stem.setAttribute("y2", String(noteY - 34));
    stem.setAttribute("stroke", "#0b6e4f");
    stem.setAttribute("stroke-width", "2");
    svg.appendChild(stem);

    const clefText = document.createElementNS(ns, "text");
    clefText.setAttribute("x", "34");
    clefText.setAttribute("y", "58");
    clefText.setAttribute("font-size", "14");
    clefText.setAttribute("fill", "#1b1f23");
    clefText.textContent = note.clef === "treble" ? "Diskantti" : "Basso";
    svg.appendChild(clefText);

    staffWrapEl.appendChild(svg);
    clefEl.textContent = `Klaavi: ${note.clef === "treble" ? "Diskantti" : "Bassoklaavi"}`;
  }

  function renderStats() {
    const noteRatio = progress.stats.noteTotal
      ? Math.round((progress.stats.noteCorrect / progress.stats.noteTotal) * 100)
      : 0;
    const rhythmRatio = progress.stats.rhythmTotal
      ? Math.round((progress.stats.rhythmCorrect / progress.stats.rhythmTotal) * 100)
      : 0;
    statsEl.textContent = `Nuotit: ${progress.stats.noteCorrect}/${progress.stats.noteTotal} (${noteRatio} %) | Rytmi: ${progress.stats.rhythmCorrect}/${progress.stats.rhythmTotal} (${rhythmRatio} %) | Putki: ${progress.streak}`;
  }

  function nextRound() {
    current = data.notes[Math.floor(Math.random() * data.notes.length)];
    renderStaff(current);
    targetEl.textContent = "Mika vaihtoehto vastaa nuottia viivastolla?";
  }

  noteOptions.forEach((answerOption) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.type = "button";
    b.textContent = answerOption;
    b.addEventListener("click", () => {
      const ok = answerOption === current.answer;
      progress.stats.noteTotal += 1;
      if (ok) progress.stats.noteCorrect += 1;
      saveProgress(progress);
      progress = addPracticeMinutes(0.4);
      targetEl.textContent = ok ? "Oikein!" : `Vaarin. Oikea oli ${current.answer}.`;
      renderStats();
      window.setTimeout(nextRound, 700);
    });
    choicesEl.appendChild(b);
  });

  playBtn.addEventListener("click", () => playNote(current.midi));

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

  function beatsInMeasure() {
    return measure.reduce((sum, piece) => sum + Number(piece.beats), 0);
  }

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

  function pickKeyQuestion() {
    keyQuestion = data.keyDeck.questions[Math.floor(Math.random() * data.keyDeck.questions.length)];
    keyQuestionEl.textContent = keyQuestion.prompt;
    keyFeedbackEl.textContent = "Valitse vastaus.";
    keyOptionsEl.innerHTML = "";
    keyQuestion.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        const ok = idx === keyQuestion.correctIndex;
        progress = loadProgress();
        progress.stats.keyTotal += 1;
        if (ok) progress.stats.keyCorrect += 1;
        saveProgress(progress);
        keyFeedbackEl.textContent = ok ? "Oikein!" : `Vaarin. Oikea vastaus: ${keyQuestion.options[keyQuestion.correctIndex]}.`;
        progress = addPracticeMinutes(0.3);
      });
      keyOptionsEl.appendChild(btn);
    });
  }

  keyNextBtn.addEventListener("click", () => pickKeyQuestion());

  pickTimeSignature();
  nextRound();
  renderStats();
  renderMeasure();
  pickKeyQuestion();
}
