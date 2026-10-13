import { useState, type CSSProperties } from "react";
import "./charades.css";
import Settings from "./settings";
import Gameplay from "./gameplay";
import FullscreenButton, { useFullscreen } from "./fullscreen";
import type { GameSettings } from "./concepts";

type Screen = "home" | "settings" | "game";
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const LETTERS = [
  { ch: "C", color: "var(--cyan)", tilt: -6 },
  { ch: "H", color: "var(--paper)", tilt: 4 },
  { ch: "A", color: "var(--sun)", tilt: -3 },
  { ch: "R", color: "var(--pink)", tilt: 5 },
  { ch: "A", color: "var(--paper)", tilt: -5 },
  { ch: "D", color: "var(--cyan)", tilt: 3 },
  { ch: "E", color: "var(--sun)", tilt: -4 },
  { ch: "S", color: "var(--pink)", tilt: 6 },
];

const SHAPES = [
  { kind: "circle", color: "var(--cyan)", x: "6%", y: "14%", size: "4.5rem", dur: "7s", delay: "0s" },
  { kind: "tri", color: "var(--sun)", x: "84%", y: "12%", size: "4rem", dur: "9s", delay: "-2s" },
  { kind: "ring", color: "var(--pink)", x: "76%", y: "70%", size: "6rem", dur: "8s", delay: "-4s" },
  { kind: "sq", color: "var(--mint)", x: "8%", y: "72%", size: "3.5rem", dur: "10s", delay: "-1s" },
  { kind: "circle", color: "var(--lilac)", x: "88%", y: "42%", size: "2.2rem", dur: "6s", delay: "-3s" },
  { kind: "tri", color: "var(--orange)", x: "4%", y: "44%", size: "2.6rem", dur: "11s", delay: "-5s" },
  { kind: "ring", color: "var(--sun)", x: "46%", y: "88%", size: "3rem", dur: "9s", delay: "-6s" },
];

type HomeProps = {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onStart: () => void;
};

function Home({ fullscreen, onToggleFullscreen, onStart }: HomeProps) {
  return (
    <main className="home">
      <div className="corner">
        <FullscreenButton active={fullscreen} onToggle={onToggleFullscreen} />
      </div>

      <h1 className="logo" aria-label="Charades">
        {LETTERS.map((l, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="logo-letter"
            style={{ "--i": i, "--tilt": `${l.tilt}deg`, "--color": l.color } as CSSVars}
          >
            {l.ch}
          </span>
        ))}
      </h1>
      <p className="tagline">Act it out. Guess it fast.</p>
      <button className="btn btn-xl btn-pulse" onClick={onStart}>
        Start
      </button>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  // Opciones elegidas en Settings; Gameplay las recibe al empezar.
  const [settings, setSettings] = useState<GameSettings>({ category: "remix", endless: true, minutes: 2, tilt: true });

  // Pantalla completa real; mientras está activa la pantalla del celular no se apaga.
  const { active: fullscreen, toggle: toggleFullscreen } = useFullscreen();

  return (
    <div className="app">
      <div className="shapes" aria-hidden="true">
        {SHAPES.map((s, i) => (
          <span
            key={i}
            className={`shape shape-${s.kind}`}
            style={
              { "--c": s.color, "--x": s.x, "--y": s.y, "--s": s.size, "--d": s.dur, "--delay": s.delay } as CSSVars
            }
          />
        ))}
      </div>

      {/* key = reinicia la animación de entrada en cada cambio de pantalla */}
      <div className="screen" key={screen}>
        {screen === "home" && (
          <Home
            fullscreen={fullscreen}
            onToggleFullscreen={toggleFullscreen}
            onStart={() => setScreen("settings")}
          />
        )}
        {screen === "settings" && (
          <Settings
            fullscreen={fullscreen}
            onToggleFullscreen={toggleFullscreen}
            onBack={() => setScreen("home")}
            initial={settings}
            onStart={(next) => {
              setSettings(next);
              setScreen("game");
            }}
          />
        )}
        {screen === "game" && <Gameplay settings={settings} onExit={() => setScreen("settings")} />}
      </div>
    </div>
  );
}
