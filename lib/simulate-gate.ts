/**
 * When true, sim UI + `/api/simulate` stay off everywhere (including `pnpm dev`).
 * Default false: local `pnpm dev` runs the sim; production stays off (NODE_ENV).
 */
export const SIMULATE_TEMPORARILY_DISABLED = false;
