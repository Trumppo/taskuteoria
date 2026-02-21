import { playNote, setMasterGain } from "../audio/synth";
import { addPracticeMinutes, registerSession, saveProgress } from "../progress";
import { loadSettings } from "../settings";
import { getLevel } from "../level";
import { markSeen, pickTask, recordResult, updateCooldown } from "../taskSelection";

type NoteItem = {
  answer: string;
  id: string;
  midi: number;
  clef: "treble" | "bass";
  staffPos: number;
  level?: "beginner" | "intermediate" | "expert";
  weight?: number;
};

export type NuotitData = {
  notes: NoteItem[];
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initNuotit(data: NuotitData): void {
  const settings = loadSettings();
  setMasterGain(settings.masterGain);

  const targetEl = getRequiredElement<HTMLElement>("feedback");
  const clefEl = getRequiredElement<HTMLElement>("clef-label");
  const staffWrapEl = getRequiredElement<HTMLElement>("staff-wrap");
  const choicesEl = getRequiredElement<HTMLElement>("choices");
  const statsEl = getRequiredElement<HTMLElement>("stats");
  const playBtn = getRequiredElement<HTMLButtonElement>("play-btn");

  const level = getLevel();
  const pool = data.notes.filter((note) => (note.level ?? "beginner") === level);
  let current = pool[0];
  let progress = registerSession();
  const noteOptions = [...new Set(pool.map((note) => note.answer))];
  const selectionOptions = { cooldown: 3, minSamples: 5, recencyDays: 7 };
  const emptyEl = document.getElementById("level-empty");
  const sections = document.querySelectorAll("[data-level-section]");

  if (pool.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    sections.forEach((section) => {
      if (section instanceof HTMLElement) section.hidden = true;
    });
    targetEl.textContent = "Ei sisaltoa talle tasolle viela.";
    playBtn.disabled = true;
    choicesEl.innerHTML = "";
    statsEl.textContent = "";
    return;
  }

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
    statsEl.textContent = `Nuotit: ${progress.stats.noteCorrect}/${progress.stats.noteTotal} (${noteRatio} %) | Putki: ${progress.streak}`;
  }

  function nextRound() {
    current = pickTask("nuotit", pool, selectionOptions);
    markSeen("nuotit", current.id);
    updateCooldown("nuotit", current.id, selectionOptions.cooldown);
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
      recordResult("nuotit", current.id, ok);
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

  nextRound();
  renderStats();
}
