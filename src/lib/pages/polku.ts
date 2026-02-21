function getElements(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector)).filter((el): el is HTMLElement => el instanceof HTMLElement);
}

export default function initPolku(): void {
  const toggles = getElements("[data-day-toggle]");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const index = toggle.getAttribute("data-day-toggle");
      if (!index) return;
      const panel = document.querySelector(`[data-day-panel="${index}"]`);
      if (!(panel instanceof HTMLElement)) return;
      const currentlyOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", currentlyOpen ? "false" : "true");
      panel.hidden = currentlyOpen;
    });
  });
}
