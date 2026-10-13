import { useEffect, useState } from "react";
import { useWakeLock } from "./wakelock";

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function isFullscreenSupported(): boolean {
  const d = document as FsDocument;
  return Boolean(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

function isFullscreenActive(): boolean {
  const d = document as FsDocument;
  return Boolean(d.fullscreenElement || d.webkitFullscreenElement);
}

async function toggleFullscreen(): Promise<void> {
  const d = document as FsDocument;
  const el = document.documentElement as FsElement;
  try {
    if (isFullscreenActive()) {
      await (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
    } else {
      await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
    }
  } catch {
    /* el navegador puede rechazar la petición */
  }
}

/** Estado real de pantalla completa. Mientras está activa, la pantalla del celular no se apaga. */
export function useFullscreen() {
  const [active, setActive] = useState(isFullscreenActive);

  // Mantener el estado sincronizado (también cuando el usuario sale con Esc o con un gesto)
  useEffect(() => {
    const sync = () => setActive(isFullscreenActive());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  // Mantener la pantalla encendida mientras esté en pantalla completa.
  useWakeLock(active);

  return { active, toggle: toggleFullscreen };
}

type Props = {
  active: boolean;
  onToggle: () => void;
};

/** Si el navegador no soporta pantalla completa (p. ej. iPhone), el botón no se muestra. */
export default function FullscreenButton({ active, onToggle }: Props) {
  if (!isFullscreenSupported()) return null;

  return (
    <button
      className="icon-btn"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Exit full screen" : "Enter full screen"}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {active ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        )}
      </svg>
    </button>
  );
}
