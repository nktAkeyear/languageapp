/**
 * The rank ladder's names (original: the tide coming in, then the lighthouse). Every job has five ranks; the tea
 * house goes two further (英検準1級 / 1級 material: the open sea, then the pole star). No imports, so placement.ts,
 * engine.ts and core/difficulty.ts can all use it.
 */
export const RANK_NAMES = ['さざ波', '潮だまり', '満ち潮', '大潮', '灯台', '外海', '北極星'];

export function rankName(rank: number): string {
  return RANK_NAMES[rank - 1] ?? `${rank}`;
}
