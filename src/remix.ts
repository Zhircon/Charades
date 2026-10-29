import type { CategoryId } from "./concepts";

/** Todas las categorías, en el orden en que se muestran los interruptores de Remix. */
export const ALL_CATEGORIES: CategoryId[] = [
  "movies",
  "series",
  "celebrities",
  "food",
  "animals",
  "objects",
  "actions",
  "emotions",
];

/** Enciende o apaga una categoría de Remix. Siempre queda al menos una encendida
    y la lista conserva el orden de ALL_CATEGORIES. */
export function toggleRemixCategory(current: CategoryId[], id: CategoryId): CategoryId[] {
  const next = new Set(current);
  if (next.has(id)) {
    if (next.size === 1) return current; // no se puede apagar la última
    next.delete(id);
  } else {
    next.add(id);
  }
  return ALL_CATEGORIES.filter((c) => next.has(c));
}
