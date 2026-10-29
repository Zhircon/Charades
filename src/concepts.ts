import initSqlJs, { type Database } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { ALL_CATEGORIES } from "./remix";

export type CategoryId =
  | "actions"
  | "celebrities"
  | "movies"
  | "series"
  | "animals"
  | "food"
  | "objects"
  | "emotions";

export type SettingsCategory = "remix" | CategoryId;

export type GameSettings = {
  category: SettingsCategory;
  endless: boolean;
  minutes: number;
  tilt: boolean; // controlar con la inclinación del celular
  remixCategories: CategoryId[]; // categorías incluidas cuando se elige Remix
};

export type Concept = {
  id: number;
  en: string;
  es: string;
  categoryId: number;
};

/** id de la tabla `categories` que corresponde a cada categoría de Settings. */
const DB_CATEGORY_ID: Record<CategoryId, number> = {
  movies: 1,
  series: 2,
  celebrities: 3,
  food: 4,
  animals: 5,
  objects: 6,
  actions: 7,
  emotions: 8,
};

/* La base se descarga y se abre una sola vez; si falla, se reintenta en la siguiente llamada.
   BASE_URL hace que funcione bajo la ruta del repositorio en GitHub Pages (/mi-repo/). */
let dbPromise: Promise<Database> | null = null;

function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [SQL, res] = await Promise.all([
        initSqlJs({ locateFile: () => wasmUrl }),
        fetch(`${import.meta.env.BASE_URL}charades.db`),
      ]);
      if (!res.ok) throw new Error(`No se pudo descargar charades.db (HTTP ${res.status})`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      // Un archivo SQLite empieza con "SQLite format 3". Si no, el servidor devolvió otra cosa
      // (por ejemplo index.html porque la ruta del archivo o el "base" de Vite no coinciden).
      const header = String.fromCharCode(...bytes.slice(0, 15));
      if (header !== "SQLite format 3") {
        throw new Error("charades.db no es una base SQLite (¿ruta incorrecta? Debe estar en public/charades.db)");
      }
      return new SQL.Database(bytes);
    })().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

/** Conceptos de una categoría. Con "remix" devuelve los de las categorías de `remixCategories`
    (por defecto todas). */
export async function loadConcepts(
  category: SettingsCategory,
  remixCategories: CategoryId[] = ALL_CATEGORIES,
): Promise<Concept[]> {
  const ids = (category === "remix" ? remixCategories : [category]).map((c) => DB_CATEGORY_ID[c]);
  if (ids.length === 0) return [];

  const db = await getDb();
  const stmt = db.prepare(
    `SELECT id, en_description AS en, es_description AS es, category_id AS categoryId
       FROM concepts WHERE category_id IN (${ids.map(() => "?").join(",")})`,
  );
  try {
    stmt.bind(ids);
    const rows: Concept[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject();
      rows.push({
        id: Number(r.id),
        en: String(r.en),
        es: String(r.es),
        categoryId: Number(r.categoryId),
      });
    }
    return rows;
  } finally {
    stmt.free();
  }
}

/** Fisher–Yates. `avoidFirst` evita que la primera tarjeta repita la última de la baraja anterior. */
export function shuffle<T extends { id: number | string }>(list: T[], avoidFirst?: T): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (avoidFirst && a.length > 1 && a[0].id === avoidFirst.id) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}
