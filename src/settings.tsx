import { useState, type CSSProperties } from "react";
import FullscreenButton from "./fullscreen";
import type { GameSettings } from "./concepts";
import { unlockAudio } from "./sound";
import { requestTiltPermission } from "./tilt";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type Props = {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
  initial: GameSettings; // lo último que eligió el usuario (se conserva al volver del juego)
  onStart: (settings: GameSettings) => void;
};

type Category = {
  id: GameSettings["category"];
  label: string;
  icon: string;
  color: string;
  desc: string;
  samples: string[];
};

const CATEGORIES: Category[] = [
  {
    id: "remix",
    label: "Remix",
    icon: "🎲",
    color: "var(--cyan)",
    desc: "All categories mixed for a great variety.",
    samples: ["Walk", "Shakira", "Axolotl"],
  },
  {
    id: "actions",
    label: "Actions",
    icon: "🏃",
    color: "var(--sun)",
    desc: "Verbs to act out with your whole body.",
    samples: ["Sneeze", "Surf", "Bake a cake"],
  },
  {
    id: "celebrities",
    label: "Celebrities",
    icon: "⭐",
    color: "var(--pink)",
    desc: "Famous faces from music, sport and screen.",
    samples: ["Messi", "Frida Kahlo", "Elvis"],
  },
  {
    id: "movies",
    label: "Movies",
    icon: "🎬",
    color: "var(--mint)",
    desc: "Titles from animated hits to big classics.",
    samples: ["Shrek", "Titanic", "Coco"],
  },
  {
    id: "series",
    label: "Series",
    icon: "📺",
    color: "var(--orange)",
    desc: "Shows you have probably binged.",
    samples: ["Friends", "Squid Game", "Lost"],
  },
  {
    id: "animals",
    label: "Animals",
    icon: "🦒",
    color: "var(--lilac)",
    desc: "From the farm to the deep sea.",
    samples: ["Sloth", "Octopus", "Flamingo"],
  },
  {
    id: "food",
    label: "Fruits & veggies",
    icon: "🍍",
    color: "var(--sun)",
    desc: "Fresh things you can find at the market.",
    samples: ["Pineapple", "Carrot", "Avocado"],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "🔑",
    color: "var(--cyan)",
    desc: "Things in an office, classroom or house.",
    samples: ["Scissors", "Mirror", "Stapler"],
  },
  {
    id: "emotions",
    label: "Emotions",
    icon: "😤",
    color: "var(--pink)",
    desc: "Show how you feel without saying a word.",
    samples: ["Jealous", "Proud", "Bored"],
  },
];

const MIN_MINUTES = 1;
const MAX_MINUTES = 10;

export default function Settings({
  fullscreen,
  onToggleFullscreen,
  onBack,
  initial,
  onStart,
}: Props) {
  const [categoryId, setCategoryId] = useState<Category["id"]>(initial.category);
  const [endless, setEndless] = useState(initial.endless);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [tilt, setTilt] = useState(initial.tilt);

  const active = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];

  return (
    <main className="settings" style={{ "--accent": active.color } as CSSVars}>
      <header className="settings-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h1 className="logo-small">CHARADES</h1>
        <div className="head-end">
          <FullscreenButton active={fullscreen} onToggle={onToggleFullscreen} />
        </div>
      </header>

      {/* Solo esta zona hace scroll. El botón Start vive fuera para que su anillo
          pulsante no agrande el área desplazable (era la causa de la barra de scroll). */}
      <div className="settings-scroll">
        <nav className="cats" aria-label="Category">
          <h2 className="panel-title">Category</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  className="cat"
                  aria-pressed={c.id === categoryId}
                  style={{ "--c": c.color } as CSSVars}
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className="cat-icon" aria-hidden="true">
                    {c.icon}
                  </span>
                  <span className="cat-label">{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="options">
          <div className="desc-card" aria-live="polite">
            {/* key = la tarjeta se anima cada vez que cambia la categoría */}
            <div className="desc-inner" key={active.id}>
              <span className="desc-icon" aria-hidden="true">
                {active.icon}
              </span>
              <h2 className="desc-title">{active.label}</h2>
              <p className="desc-text">{active.desc}</p>
              <div className="chips">
                {active.samples.map((s, k) => (
                  <span key={s} className="chip" style={{ "--k": k } as CSSVars}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="time-card">
            <div className="time-row">
              <span id="endless-label">Endless</span>
              <button
                role="switch"
                aria-checked={endless}
                aria-labelledby="endless-label"
                className={`switch${endless ? " on" : ""}`}
                onClick={() => setEndless((v) => !v)}
              />
            </div>

            <div className="time-row">
              <span id="tilt-label">Tilt controls</span>
              <button
                role="switch"
                aria-checked={tilt}
                aria-labelledby="tilt-label"
                className={`switch${tilt ? " on" : ""}`}
                onClick={() => setTilt((v) => !v)}
              />
            </div>

            <div className="time-row">
              <span id="minutes-label">Minutes per round</span>
              <div className="stepper" data-off={endless} role="group" aria-labelledby="minutes-label">
                <button
                  className="step-btn"
                  aria-label="One minute less"
                  disabled={endless || minutes <= MIN_MINUTES}
                  onClick={() => setMinutes((m) => Math.max(MIN_MINUTES, m - 1))}
                >
                  −
                </button>
                <span className="minutes-value" key={minutes}>
                  {minutes}
                </span>
                <button
                  className="step-btn"
                  aria-label="One minute more"
                  disabled={endless || minutes >= MAX_MINUTES}
                  onClick={() => setMinutes((m) => Math.min(MAX_MINUTES, m + 1))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="settings-foot">
        <button
          className="btn btn-xl btn-pulse"
          onClick={() => {
            unlockAudio(); // el audio solo se puede activar desde un toque del usuario
            // iOS pide permiso de sensores y solo lo permite dentro de un toque; en Android no pregunta.
            const ready = tilt ? requestTiltPermission() : Promise.resolve();
            void ready.then(() => onStart({ category: categoryId, endless, minutes, tilt }));
          }}
        >
          Start
        </button>
      </footer>
    </main>
  );
}
