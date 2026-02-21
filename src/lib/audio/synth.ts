let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
  }
  return ctx;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function env(gain: GainNode, start: number, dur: number): void {
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(1, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
}

export function playNote(midi: number, duration = 0.55): void {
  const a = ensureContext();
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();

  osc.type = "triangle";
  osc.frequency.value = midiToFreq(midi);

  osc.connect(g);
  g.connect(master!);

  env(g, t, duration);
  osc.start(t);
  osc.stop(t + duration + 0.03);
}

export function playInterval(rootMidi: number, semitones: number, harmonic = false): void {
  if (harmonic) {
    playNote(rootMidi, 0.9);
    playNote(rootMidi + semitones, 0.9);
    return;
  }
  playNote(rootMidi, 0.45);
  setTimeout(() => playNote(rootMidi + semitones, 0.45), 470);
}

export function playChord(rootMidi: number, quality: "major" | "minor" = "major"): void {
  const third = quality === "major" ? 4 : 3;
  [rootMidi, rootMidi + third, rootMidi + 7].forEach((m) => playNote(m, 0.95));
}

export function playMetronome(bpm: number, timeSig: "4/4" | "3/4" | "6/8"): () => void {
  const a = ensureContext();
  const beats = Number(timeSig.split("/")[0]);
  const beatDur = 60 / bpm;
  let i = 0;
  const interval = window.setInterval(() => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "sine";
    osc.frequency.value = i % beats === 0 ? 1360 : 920;
    osc.connect(g);
    g.connect(master!);
    const t = a.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.09);
    i += 1;
  }, beatDur * 1000);

  return () => window.clearInterval(interval);
}
