import { addPracticeMinutes, registerSession } from "../progress";

type MiniQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type MiniLesson = {
  title: string;
  summary: string;
  questions: MiniQuestion[];
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initKirjasto(lessons: MiniLesson[]): void {
  registerSession();
  const titleEl = getRequiredElement<HTMLElement>("mini-title");
  const summaryEl = getRequiredElement<HTMLElement>("mini-summary");
  const metaEl = getRequiredElement<HTMLElement>("mini-meta");
  const progressEl = getRequiredElement<HTMLElement>("mini-progress");
  const questionEl = getRequiredElement<HTMLElement>("mini-question");
  const optionsEl = getRequiredElement<HTMLElement>("mini-options");
  const feedbackEl = getRequiredElement<HTMLElement>("mini-feedback");
  const nextQuestionBtn = getRequiredElement<HTMLButtonElement>("mini-next-question");
  const nextLessonBtn = getRequiredElement<HTMLButtonElement>("mini-next-lesson");

  let lessonIndex = 0;
  let questionIndex = 0;
  let correctCount = 0;
  let answeredCount = 0;
  let answeredCurrent = false;

  function lesson(): MiniLesson {
    return lessons[lessonIndex % lessons.length];
  }

  function renderQuestion() {
    const currentLesson = lesson();
    const q = currentLesson.questions[questionIndex];
    titleEl.textContent = currentLesson.title;
    summaryEl.textContent = currentLesson.summary;
    metaEl.textContent = `Mini-opetus ${lessonIndex + 1}/${lessons.length}`;
    progressEl.textContent = `Kysymys ${questionIndex + 1}/3 | Oikein ${correctCount}/${answeredCount}`;
    questionEl.textContent = q.prompt;
    feedbackEl.textContent = "Valitse vastaus.";
    optionsEl.innerHTML = "";
    answeredCurrent = false;
    q.options.forEach((opt, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (answeredCurrent) return;
        answeredCurrent = true;
        answeredCount += 1;
        const ok = idx === q.correctIndex;
        if (ok) correctCount += 1;
        addPracticeMinutes(0.3);
        feedbackEl.textContent = ok ? "Oikein!" : `Vaarin. Oikea oli: ${q.options[q.correctIndex]}.`;
        Array.from(optionsEl.querySelectorAll("button")).forEach((node) => {
          if (node instanceof HTMLButtonElement) node.disabled = true;
        });
        progressEl.textContent = `Kysymys ${questionIndex + 1}/3 | Oikein ${correctCount}/${answeredCount}`;
      });
      optionsEl.appendChild(b);
    });
  }

  nextQuestionBtn.addEventListener("click", () => {
    const max = lesson().questions.length;
    questionIndex = (questionIndex + 1) % max;
    renderQuestion();
  });

  nextLessonBtn.addEventListener("click", () => {
    lessonIndex = (lessonIndex + 1) % lessons.length;
    questionIndex = 0;
    correctCount = 0;
    answeredCount = 0;
    renderQuestion();
  });

  renderQuestion();
}
