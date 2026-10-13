import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { loadConcepts, shuffle, type Concept, type GameSettings } from "./concepts";
import { playCorrect, playSkip, playTick, unlockAudio } from "./sound";
import { BACK_ACTION, FORWARD_ACTION, getTiltSupport, useTilt } from "./tilt";
import { useWakeLock } from "./wakelock";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type Props = {
  settings: GameSettings;
  onExit: () => void;
};

type Flash = { kind: "got" | "skip"; n: number };

/** Tamaño de la baraja: se sortean hasta 70 conceptos de la categoría elegida. */
const DECK_SIZE = 70;
/** Escala mínima del texto cuando un concepto es muy largo (1 = tamaño completo). */
const MIN_FIT = 0.25;
const makeDeck = (pool: Concept[], avoidFirst?: Concept) => shuffle(pool, avoidFirst).slice(0, DECK_SIZE);

const actionLabel = (a: "gotIt" | "skip") => (a === "gotIt" ? "Got it!" : "Skip");

export default function Gameplay({ settings, onExit }: Props) {
  const { category, endless, minutes, tilt } = settings;
  const roundSeconds = minutes * 60;

  const [pool, setPool] = useState<Concept[]>([]); // todos los conceptos de la categoría
  const [deck, setDeck] = useState<Concept[]>([]); // baraja de la ronda (orden aleatorio)
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(3);
  const [seconds, setSeconds] = useState(roundSeconds);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);

  const loaded = deck.length > 0;
  const playing = loaded && count === 0;
  const finished = !endless && seconds === 0;
  const word = deck[index];
  const wordsRef = useRef<HTMLDivElement>(null);

  // La pantalla no se apaga mientras esta pantalla de juego esté abierta.
  useWakeLock(true);

  // Carga de conceptos desde SQLite
  useEffect(() => {
    let cancelled = false;
    loadConcepts(category)
      .then((list) => {
        if (cancelled) return;
        if (list.length === 0) {
          setError("La consulta no devolvió conceptos para esta categoría.");
          return;
        }
        setPool(list);
        setDeck(makeDeck(list));
      })
      .catch((err: unknown) => {
        console.error("Charades: no se pudieron cargar los conceptos", err);
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  // Cuenta regresiva 3-2-1 (empieza cuando ya cargaron los conceptos)
  useEffect(() => {
    if (!loaded || count === 0) return undefined;
    const id = window.setTimeout(() => setCount((c) => c - 1), 900);
    return () => window.clearTimeout(id);
  }, [loaded, count]);

  // Temporizador de ronda (no corre en modo Endless) con tic-tac:
  // un tick por segundo y, en los últimos 10 segundos, uno cada medio segundo.
  useEffect(() => {
    if (!playing || endless || seconds === 0) return undefined;
    const urgent = seconds <= 10;
    playTick(urgent);
    const half = urgent ? window.setTimeout(() => playTick(true), 500) : undefined;
    const next = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => {
      window.clearTimeout(next);
      if (half !== undefined) window.clearTimeout(half);
    };
  }, [playing, endless, seconds]);

  // Ajuste de texto: si el concepto es largo, se reduce la letra hasta que quepa en la tarjeta.
  useLayoutEffect(() => {
    const words = wordsRef.current;
    const card = words?.parentElement;
    const stage = words?.closest<HTMLElement>(".game-stage");
    if (!words || !card || !stage) return undefined;

    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      const cs = getComputedStyle(card);
      const maxHeight = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      let scale = 1;
      words.style.setProperty("--fit", "1");
      while (scale > MIN_FIT && (words.offsetHeight > maxHeight || words.scrollWidth > words.clientWidth + 1)) {
        scale *= 0.92;
        words.style.setProperty("--fit", scale.toFixed(3));
      }
    };

    fit();
    const observer = new ResizeObserver(fit); // al girar el celular o entrar/salir de pantalla completa
    observer.observe(stage);
    document.fonts?.ready.then(fit); // por si la fuente termina de cargar después
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [word?.id]);

  // Siguiente concepto; al terminar la baraja se vuelve a barajar.
  const advance = () => {
    if (index + 1 < deck.length) {
      setIndex(index + 1);
    } else {
      setDeck(makeDeck(pool, deck[deck.length - 1]));
      setIndex(0);
    }
  };

  const gotIt = () => {
    playCorrect();
    setFlash({ kind: "got", n: Date.now() });
    setScore((s) => s + 1);
    advance();
  };

  const skip = () => {
    playSkip();
    setFlash({ kind: "skip", n: Date.now() });
    setSkipped((s) => s + 1);
    advance();
  };

  // Control por inclinación: la inclinación hacia el frente / hacia atrás dispara Got it! / Skip.
  useTilt(tilt && playing && !finished, { onGotIt: gotIt, onSkip: skip });

  const restart = () => {
    unlockAudio();
    setDeck(makeDeck(pool));
    setIndex(0);
    setScore(0);
    setSkipped(0);
    setFlash(null);
    setSeconds(roundSeconds);
    setCount(3);
  };

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = endless ? 100 : (seconds / roundSeconds) * 100;

  // Instrucción que se muestra durante la cuenta regresiva
  const support = getTiltSupport();
  const tiltHint = !tilt
    ? null
    : support === "denied"
      ? "Motion access was denied. Use the buttons."
      : `Phone on your forehead. Tilt forward: ${actionLabel(FORWARD_ACTION)} · Tilt back: ${actionLabel(BACK_ACTION)}`;

  return (
    <main className="game">
      {!loaded && !error && (
        <div className="countdown" role="status" aria-live="polite">
          <span className="count-hint">Loading…</span>
        </div>
      )}

      {error && (
        <div className="results" role="alertdialog" aria-label="Error">
          <h2 className="results-title">Oops!</h2>
          <span className="results-label">Couldn't load the concepts.</span>
          <span className="results-detail">{error}</span>
          <div className="results-actions">
            <button className="btn" onClick={onExit}>
              Back to settings
            </button>
          </div>
        </div>
      )}

      {loaded && count > 0 && (
        <div className="countdown" role="status" aria-live="assertive">
          <span className="count-num" key={count} data-n={count}>
            {count}
          </span>
          <span className="count-hint">Get ready</span>
          {tiltHint && <span className="count-sub">{tiltHint}</span>}
        </div>
      )}

      {flash && (
        <div
          className="flash"
          key={flash.n}
          data-kind={flash.kind}
          aria-hidden="true"
          onAnimationEnd={() => setFlash(null)}
        >
          <span>{flash.kind === "got" ? "Got it!" : "Skip"}</span>
        </div>
      )}

      {finished && (
        <div className="results" role="dialog" aria-modal="true" aria-label="Round results">
          <h2 className="results-title">Time's up!</h2>
          <span className="results-score">{score}</span>
          <span className="results-label">
            {score === 1 ? "concept guessed" : "concepts guessed"}
            {skipped > 0 ? ` · ${skipped} skipped` : ""}
          </span>
          <div className="results-actions">
            <button className="btn" onClick={restart}>
              Play again
            </button>
            <button className="btn btn-ghost" onClick={onExit}>
              Back to settings
            </button>
          </div>
        </div>
      )}

      <header className="game-top">
        <button className="icon-btn" onClick={onExit} aria-label="Exit game">
          ✕
        </button>

        <div className={`timer${!endless && seconds <= 10 ? " urgent" : ""}`}>
          <span className="timer-time">{endless ? "∞" : `${mm}:${ss}`}</span>
          <div className="timer-track" aria-hidden="true">
            <div className="timer-fill" style={{ "--pct": `${pct}%` } as CSSVars} />
          </div>
        </div>

        <div className="score" aria-label={`Score ${score}`}>
          <span className="score-num" key={score}>
            {score}
          </span>
          <span>pts</span>
        </div>
      </header>

      <section className="game-stage">
        {word && (
          /* key = cada concepto nuevo entra con un giro de tarjeta */
          <article className="play-card" key={word.id}>
            <div className="play-words" ref={wordsRef}>
              <h1 className="word-main">{word.en}</h1>
              <p className="word-alt">{word.es}</p>
            </div>
          </article>
        )}
      </section>

      <footer className="game-actions">
        <button className="btn btn-ghost" onClick={skip} disabled={!playing || finished}>
          Skip
        </button>
        <button className="btn" onClick={gotIt} disabled={!playing || finished}>
          Got it!
        </button>
      </footer>
    </main>
  );
}
