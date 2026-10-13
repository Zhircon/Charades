import { useEffect, useRef, useState } from "react";

/* Control por inclinación con el celular en la frente (pantalla hacia el público).
   Usa DeviceOrientationEvent, que ya trae el navegador (no requiere librerías).

   Se calcula hacia dónde apunta la pantalla: up = cos(beta) · cos(gamma)
     up ≈  0  → celular vertical (posición neutra, en la frente)
     up → -1  → pantalla mirando al piso    (inclinar hacia el frente) → "Got it!"
     up → +1  → pantalla mirando al techo   (inclinar hacia atrás)     → "Skip"
   Funciona igual en vertical u horizontal. Si el sentido te queda al revés,
   intercambia FORWARD_ACTION y BACK_ACTION. */

const FORWARD_LIMIT = -0.55; // ≈ 33° pasando la vertical
const BACK_LIMIT = 0.55;
const REARM_LIMIT = 0.3; // hay que volver cerca de la vertical antes de otra acción
const COOLDOWN_MS = 700;
const NO_SENSOR_TIMEOUT_MS = 1500;

export const FORWARD_ACTION: "gotIt" | "skip" = "gotIt";
export const BACK_ACTION: "gotIt" | "skip" = "skip";

export type TiltSupport = "unknown" | "granted" | "denied" | "unsupported";

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

let support: TiltSupport = "unknown";

export function getTiltSupport(): TiltSupport {
  return support;
}

/** Pide permiso de sensores. iOS lo exige y solo lo permite dentro de un toque del usuario
    (por eso se llama desde el botón Start). En Android no hay aviso. */
export async function requestTiltPermission(): Promise<TiltSupport> {
  if (typeof DeviceOrientationEvent === "undefined") {
    support = "unsupported";
    return support;
  }
  const Ctor = DeviceOrientationEvent as OrientationCtor;
  if (typeof Ctor.requestPermission === "function") {
    try {
      support = (await Ctor.requestPermission()) === "granted" ? "granted" : "denied";
    } catch {
      support = "denied";
    }
  } else {
    support = "granted";
  }
  return support;
}

type Handlers = {
  onGotIt: () => void;
  onSkip: () => void;
};

/** Escucha la inclinación mientras `enabled` sea true. Devuelve si hay sensor (null = aún no se sabe). */
export function useTilt(enabled: boolean, { onGotIt, onSkip }: Handlers): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  // Siempre se llama la versión más reciente de los callbacks sin reiniciar el listener
  const handlers = useRef<Handlers>({ onGotIt, onSkip });
  handlers.current = { onGotIt, onSkip };

  useEffect(() => {
    if (!enabled || support === "denied" || support === "unsupported") return undefined;

    let armed = false; // se arma al ver el celular cerca de la vertical
    let lastAt = -COOLDOWN_MS; // sin enfriamiento pendiente al empezar
    let gotReading = false;

    const run = (action: "gotIt" | "skip") => {
      if (action === "gotIt") handlers.current.onGotIt();
      else handlers.current.onSkip();
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return; // equipos sin sensor (PC) mandan valores nulos
      if (!gotReading) {
        gotReading = true;
        setAvailable(true);
      }

      const up = Math.cos((e.beta * Math.PI) / 180) * Math.cos((e.gamma * Math.PI) / 180);

      if (!armed) {
        if (Math.abs(up) < REARM_LIMIT) armed = true;
        return;
      }

      const now = performance.now();
      if (now - lastAt < COOLDOWN_MS) return;

      if (up <= FORWARD_LIMIT) {
        armed = false;
        lastAt = now;
        run(FORWARD_ACTION);
      } else if (up >= BACK_LIMIT) {
        armed = false;
        lastAt = now;
        run(BACK_ACTION);
      }
    };

    window.addEventListener("deviceorientation", onOrientation);
    const timeout = window.setTimeout(() => {
      if (!gotReading) setAvailable(false);
    }, NO_SENSOR_TIMEOUT_MS);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.clearTimeout(timeout);
    };
  }, [enabled]);

  return available;
}
