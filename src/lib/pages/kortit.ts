import { buildSrsQueue, loadSrs, reviewCard } from "../srs";
import { addPracticeMinutes, registerSession } from "../progress";

type DeckCard = {
  id: string;
  front: string;
  back: string;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element: ${id}`);
  }
  return el as T;
}

export default function initKortit(deck: DeckCard[]): void {
  registerSession();
  const front = getRequiredElement<HTMLElement>("front");
  const back = getRequiredElement<HTMLElement>("back");
  const statusEl = getRequiredElement<HTMLElement>("status");
  const showBtn = getRequiredElement<HTMLButtonElement>("show");
  const knewBtn = getRequiredElement<HTMLButtonElement>("knew");
  const didntBtn = getRequiredElement<HTMLButtonElement>("didnt");

  let currentCard: DeckCard | null = null;

  function buildQueue() {
    const now = Date.now();
    const { due, upcoming } = buildSrsQueue(now);
    if (due.length > 0) {
      const dueOrder = new Map(due.map((card) => [card.id, card.dueAt]));
      const dueCards = deck.filter((card) => dueOrder.has(card.id));
      dueCards.sort((a, b) => (dueOrder.get(a.id) ?? 0) - (dueOrder.get(b.id) ?? 0));
      statusEl.textContent = `Eraantyneet kortit: ${dueCards.length}`;
      return dueCards;
    }

    const stored = loadSrs();
    const unscheduled = deck.filter((card) => !stored[card.id]);
    if (unscheduled.length > 0) {
      statusEl.textContent = "Ei eraantyneita. Naytetaan uusi kortti.";
      return unscheduled;
    }

    if (upcoming.length > 0) {
      const upcomingOrder = new Map(upcoming.map((card) => [card.id, card.dueAt]));
      const upcomingCards = deck.filter((card) => upcomingOrder.has(card.id));
      upcomingCards.sort((a, b) => (upcomingOrder.get(a.id) ?? 0) - (upcomingOrder.get(b.id) ?? 0));
      statusEl.textContent = "Ei eraantyneita. Naytetaan seuraavaksi eraantyva kortti.";
      return upcomingCards;
    }

    statusEl.textContent = "Ei kortteja.";
    return [];
  }

  function render() {
    const queue = buildQueue();
    if (queue.length === 0) {
      currentCard = null;
      front.textContent = "Ei kortteja";
      back.textContent = "";
      back.hidden = true;
      return;
    }
    currentCard = queue[0];
    front.textContent = currentCard.front;
    back.textContent = currentCard.back;
    back.hidden = true;
  }

  showBtn.addEventListener("click", () => {
    back.hidden = false;
  });
  knewBtn.addEventListener("click", () => {
    if (!currentCard) return;
    reviewCard(currentCard.id, true);
    addPracticeMinutes(0.35);
    render();
  });
  didntBtn.addEventListener("click", () => {
    if (!currentCard) return;
    reviewCard(currentCard.id, false);
    addPracticeMinutes(0.35);
    render();
  });

  render();
}
