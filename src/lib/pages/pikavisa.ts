import { addPracticeMinutes, registerSession } from "../progress";
import { loadSettings } from "../settings";
import { playInterval, playChord, setMasterGain } from "../audio/synth";

type NoteItem = { label: string; answer: string };
type ListeningInterval = { label: string; semitones: number };
type ListeningChord = { label: string; quality: "major" | "minor" };
type KeyQuestion = { prompt: string; options: string[]; correctIndex: number };
type TimeSignature = { label: string; targetBeats: number };

export type QuizData = {
  notes: NoteItem[];
  intervals: ListeningInterval[];
  chords: ListeningChord[];
  keyQuestions: KeyQuestion[];
  timeSignatures: TimeSignature[];
};

type Question = {
  type: "note" | "timesig" | "key" | "interval" | "chord";
  prompt: string;
  options: string[];
  correct: string;
  sound?: () => void;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function initPikavisa(data: QuizData): void {
  const settings = loadSettings();
  setMasterGain(settings.masterGain);
  registerSession();

  const progressEl = getRequiredElement<HTMLElement>("quiz-progress");
  const scoreEl = getRequiredElement<HTMLElement>("quiz-score");
  const questionEl = getRequiredElement<HTMLElement>("quiz-question");
  const typeEl = getRequiredElement<HTMLElement>("quiz-type");
  const optionsEl = getRequiredElement<HTMLElement>("quiz-options");
  const feedbackEl = getRequiredElement<HTMLElement>("quiz-feedback");
  const playBtn = getRequiredElement<HTMLButtonElement>("quiz-play");
  const nextBtn = getRequiredElement<HTMLButtonElement>("quiz-next");

  const questions: Question[] = [];
  let index = 0;
  let score = 0;
  let answered = false;

  function buildQuestions() {
    const note = randomItem(data.notes);
    questions.push({
      type: "note",
      prompt: `Mika kirjainnimi vastaa nuottia ${note.label}?`,
      options: ["C", "D", "E", "F", "G", "A", "H"],
      correct: note.answer,
    });

    const sig = randomItem(data.timeSignatures);
    questions.push({
      type: "timesig",
      prompt: `Kuinka monta perusiskua harjoituksessa lasketaan tahtilajissa ${sig.label}?`,
      options: ["2", "3", "4", "6"],
      correct: String(sig.targetBeats === 3 && sig.label === "6/8" ? 3 : sig.targetBeats),
    });

    const keyQ = randomItem(data.keyQuestions);
    questions.push({
      type: "key",
      prompt: keyQ.prompt,
      options: keyQ.options,
      correct: keyQ.options[keyQ.correctIndex],
    });

    const interval = randomItem(data.intervals);
    questions.push({
      type: "interval",
      prompt: "Tunnista intervalli (paina Soita tehtava)",
      options: data.intervals.map((i) => i.label).slice(0, 6),
      correct: interval.label,
      sound: () => playInterval(60, interval.semitones, false),
    });
    if (!questions[3].options.includes(interval.label)) {
      questions[3].options[Math.floor(Math.random() * questions[3].options.length)] = interval.label;
    }

    const chord = randomItem(data.chords);
    questions.push({
      type: "chord",
      prompt: "Tunnista sointu (paina Soita tehtava)",
      options: data.chords.map((c) => c.label),
      correct: chord.label,
      sound: () => playChord(60, chord.quality),
    });
  }

  function render() {
    const q = questions[index];
    progressEl.textContent = `Kysymys ${index + 1}/5`;
    scoreEl.textContent = `Pisteet: ${score}`;
    questionEl.textContent = q.prompt;
    typeEl.textContent = `Tyyppi: ${q.type}`;
    feedbackEl.textContent = "Valitse vastaus.";
    optionsEl.innerHTML = "";
    answered = false;

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const ok = opt === q.correct;
        if (ok) score += 1;
        feedbackEl.textContent = ok ? "Oikein!" : `Vaarin. Oikea vastaus: ${q.correct}`;
        addPracticeMinutes(0.25);
      });
      optionsEl.appendChild(btn);
    });

    playBtn.disabled = typeof q.sound !== "function";
  }

  playBtn.addEventListener("click", () => {
    const q = questions[index];
    if (q.sound) q.sound();
  });

  nextBtn.addEventListener("click", () => {
    if (index < questions.length - 1) {
      index += 1;
      render();
      return;
    }
    feedbackEl.textContent = `Valmis! Lopputulos ${score}/${questions.length}.`;
    progressEl.textContent = "Pikavisa valmis";
    nextBtn.disabled = true;
  });

  buildQuestions();
  render();
}
