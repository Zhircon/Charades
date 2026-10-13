import { useEffect } from "react";

type WakeLockSentinelLike = { release(): Promise<void> };
type NavigatorWithWakeLock = {
  wakeLock?: { request(type: "screen"): Promise<WakeLockSentinelLike> };
};

/** Mantiene la pantalla encendida mientras `enabled` sea true (Screen Wake Lock API del navegador).
    Requiere HTTPS (GitHub Pages lo cumple). Si el navegador no lo soporta, no hace nada. */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const nav = navigator as unknown as NavigatorWithWakeLock;
    if (!nav.wakeLock) return undefined;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel?.release().catch(() => undefined);
        const next = await nav.wakeLock!.request("screen");
        if (cancelled) {
          next.release().catch(() => undefined);
          return;
        }
        sentinel = next;
      } catch {
        /* sin permiso o batería baja */
      }
    };

    // El navegador suelta el bloqueo al ocultar la pestaña: se vuelve a pedir al regresar.
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
}
