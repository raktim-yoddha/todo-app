// Procedural Web Audio API sound synthesizer
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("AudioContext not supported or blocked:", e);
    return null;
  }
}

/**
 * Plays a calm, melodic 4-tone chime when Pomodoro or Timer finishes
 */
export function playTimerChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 440.0, time: 0.0, dur: 0.6 },    // A4
    { freq: 554.37, time: 0.15, dur: 0.7 },  // C#5
    { freq: 659.25, time: 0.3, dur: 0.9 },   // E5
    { freq: 880.0, time: 0.48, dur: 1.2 },   // A5
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.001, now + time);
    gain.gain.exponentialRampToValueAtTime(0.18, now + time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Plays a soft mechanical click for timer start / pause
 */
export function playClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(950, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}
