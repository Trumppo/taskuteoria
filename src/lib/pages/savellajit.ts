import { addPracticeMinutes, loadProgress, registerSession, saveProgress } from "../progress";

type KeyQuestion = { prompt: string; options: string[]; correctIndex: number };
type KeyDeck = { title: string; questions: KeyQuestion[] };

export type SavellajitData = {
  keyDeck: KeyDeck;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initSavellajit(data: SavellajitData): void {
  const keyQuestionEl = getRequiredElement<HTMLElement>("key-question");
  const keyOptionsEl = getRequiredElement<HTMLElement>("key-options");
  const keyFeedbackEl = getRequiredElement<HTMLElement>("key-feedback");
  const keyNextBtn = getRequiredElement<HTMLButtonElement>("key-next");
  const statsEl = getRequiredElement<HTMLElement>("stats");

  let progress = registerSession();
  let keyQuestion = data.keyDeck.questions[0];

  function renderStats() {
    const total = progress.stats.keyTotal;
    const ratio = total ? Math.round((progress.stats.keyCorrect / total) * 100) : 0;
    statsEl.textContent = `Savellajit: ${progress.stats.keyCorrect}/${progress.stats.keyTotal} (${ratio} %) | Putki: ${progress.streak}`;
  }

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
        renderStats();
      });
      keyOptionsEl.appendChild(btn);
    });
  }

  keyNextBtn.addEventListener("click", () => pickKeyQuestion());

  renderStats();
  pickKeyQuestion();
}
