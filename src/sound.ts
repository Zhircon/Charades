/* Tick del temporizador generado con la Web Audio API del navegador (no usa archivos de audio). */

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** Llámala dentro de un clic o toque (por ejemplo al presionar Start): los navegadores
    móviles solo dejan activar el audio como respuesta a un gesto del usuario. */
export function unlockAudio(): void {
  const c = getContext();
  if (c && c.state === "suspended") void c.resume();
}

/** Un "tick" corto. `urgent` lo hace un poco más agudo y fuerte (últimos segundos). */
export function playTick(urgent = false): void {
  const c = getContext();
  if (!c || c.state !== "running") return;

  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(urgent ? 1300 : 900, t);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(urgent ? 0.4 : 0.3, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** Nota corta con envolvente suave, programada `delay` segundos adelante. */
function tone(freq: number, delay: number, duration: number, volume: number, type: OscillatorType): void {
  const c = getContext();
  if (!c || c.state !== "running") return;

  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Dos notas ascendentes: concepto adivinado. (Con el celular en la frente no se ve la pantalla,
    así que el jugador se entera por el sonido.) */
export function playCorrect(): void {
  tone(660, 0, 0.14, 0.3, "sine");
  tone(990, 0.1, 0.22, 0.3, "sine");
}

/** Nota grave descendente: concepto pasado. */
export function playSkip(): void {
  tone(300, 0, 0.12, 0.3, "triangle");
  tone(200, 0.09, 0.2, 0.3, "triangle");
}
