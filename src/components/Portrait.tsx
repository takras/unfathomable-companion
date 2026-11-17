import { characterById } from "../data/characters";

/** A character's arched portrait. */
export function Portrait({ id, size = 48, dim }: { id: string; size?: number; dim?: boolean }) {
  const ch = characterById[id];
  if (!ch) return null;
  return (
    <img
      className={`portrait ${dim ? "dim" : ""}`}
      src={ch.portrait}
      alt=""
      width={size}
      height={Math.round(size * 1.545)}
      loading="lazy"
      decoding="async"
    />
  );
}
