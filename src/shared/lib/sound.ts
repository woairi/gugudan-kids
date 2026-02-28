import { getSettings } from "./settings";

function beep(freq: number, durationMs: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, durationMs);
  } catch {
    // ignore
  }
}

export function playCorrect() {
  const s = getSettings();
  if (!s.soundOn) return;
  beep(880, 120);
}

export function playWrong() {
  const s = getSettings();
  if (!s.soundOn) return;
  beep(220, 160);
}
