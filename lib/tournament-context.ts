// Historical March Madness statistics for simulation prompts (1985-2025)

/** Seed matchup statistics with upset probabilities */
export const SEED_MATCHUP_STATS: Record<
  string,
  { upsetRate: number; note: string; upsetInstruction: string }
> = {
  // --- Round of 64 (first round) matchups ---
  "1v16": {
    upsetRate: 0.012,
    note: "1-seeds win 99% of the time. Only 2 upsets ever (UMBC 2018, FDU 2023).",
    upsetInstruction: "Pick the 1-seed unless there's an extraordinary reason not to.",
  },
  "2v15": {
    upsetRate: 0.069,
    note: "2-seeds win 93% of the time. 15-seed upsets are rare but memorable.",
    upsetInstruction: "Favor the 2-seed strongly. 15-seeds occasionally surprise.",
  },
  "3v14": {
    upsetRate: 0.144,
    note: "3-seeds win 86% of the time. About 1 upset per tournament.",
    upsetInstruction: "Favor the 3-seed. 14-seeds can win if they have strong defense.",
  },
  "4v13": {
    upsetRate: 0.206,
    note: "4-seeds win 79% of the time. 13-seeds are occasionally dangerous.",
    upsetInstruction: "Favor the 4-seed, but 13s from strong conferences can compete.",
  },
  "5v12": {
    upsetRate: 0.36,
    note: "5-seeds win 64% of the time. 12-seeds win ~1 per region historically.",
    upsetInstruction: "Favor the 5-seed, but this is the classic upset matchup - 12s win often.",
  },
  "6v11": {
    upsetRate: 0.362,
    note: "6-seeds win 64% of the time. 11-seeds are competitive, especially play-in winners.",
    upsetInstruction: "Favor the 6-seed slightly. 11-seeds with momentum are dangerous.",
  },
  "7v10": {
    upsetRate: 0.375,
    note: "7-seeds win 63% of the time. This is a competitive matchup.",
    upsetInstruction: "Slight edge to 7-seed, but 10-seeds win frequently.",
  },
  "8v9": {
    upsetRate: 0.52,
    note: "9-seeds actually win 52% of the time. This is essentially a coin flip.",
    upsetInstruction: "Treat as 50/50. Pick based on team quality, not seed number.",
  },
  // --- Round of 32 matchups ---
  "1v8": {
    upsetRate: 0.17,
    note: "1-seeds win 83% of the time against 8/9 seed winners.",
    upsetInstruction: "Favor the 1-seed. 8/9 seeds rarely have the depth to win twice.",
  },
  "1v9": {
    upsetRate: 0.17,
    note: "1-seeds win 83% of the time against 8/9 seed winners.",
    upsetInstruction: "Favor the 1-seed. 9-seeds winning two games in a row is unusual.",
  },
  "2v7": {
    upsetRate: 0.23,
    note: "2-seeds win 77% of the time against 7/10 seeds in Round of 32.",
    upsetInstruction: "Favor the 2-seed. Lower seeds face fatigue from close first-round games.",
  },
  "2v10": {
    upsetRate: 0.28,
    note: "10-seeds that beat 7-seeds are dangerous but still lose to 2-seeds ~72% of the time.",
    upsetInstruction: "Favor the 2-seed, but 10-seeds with momentum can pull upsets.",
  },
  "3v6": {
    upsetRate: 0.36,
    note: "3 vs 6 seed in Round of 32 is very competitive - essentially 60/40.",
    upsetInstruction: "Slight edge to the 3-seed, but use KenPom rankings to differentiate.",
  },
  "3v11": {
    upsetRate: 0.30,
    note: "11-seeds that advance past 6-seeds can be Cinderella threats against 3-seeds.",
    upsetInstruction: "Favor the 3-seed, but 11-seeds on a run have proven they belong.",
  },
  "4v5": {
    upsetRate: 0.47,
    note: "4 vs 5 seed matchups are near coin flips. The 5-seed wins 47% of the time.",
    upsetInstruction: "Use KenPom data and team quality rather than seed to decide.",
  },
  "4v12": {
    upsetRate: 0.25,
    note: "12-seeds that beat 5-seeds occasionally make a Sweet 16 run (~25% of the time).",
    upsetInstruction: "Favor the 4-seed, but 12-seeds in the Round of 32 are battle-tested.",
  },
  "5v13": {
    upsetRate: 0.18,
    note: "13-seeds very rarely advance to the Sweet 16 (~18% against 4/5 seeds).",
    upsetInstruction: "Favor the higher seed strongly.",
  },
  // --- Sweet 16 common matchups ---
  "1v4": {
    upsetRate: 0.28,
    note: "1-seeds win ~72% of Sweet 16 matchups against 4/5 seeds.",
    upsetInstruction: "Favor the 1-seed, but Sweet 16 opponents are proven tournament performers.",
  },
  "1v5": {
    upsetRate: 0.28,
    note: "1-seeds win ~72% of Sweet 16 matchups against 4/5 seeds.",
    upsetInstruction: "Favor the 1-seed, but 5-seeds in the Sweet 16 have earned their spot.",
  },
  "2v3": {
    upsetRate: 0.45,
    note: "2 vs 3 seed Sweet 16 matchups are extremely competitive. Near coin flip.",
    upsetInstruction: "Use KenPom efficiency data as the primary differentiator.",
  },
  "2v6": {
    upsetRate: 0.33,
    note: "2-seeds win ~67% against 6-seeds in the Sweet 16.",
    upsetInstruction: "Favor the 2-seed, but this is a quality matchup.",
  },
  // --- Elite Eight common matchups ---
  "1v2": {
    upsetRate: 0.40,
    note: "1 vs 2 seed Elite Eight matchups are extremely competitive.",
    upsetInstruction: "This is an elite matchup. Rely heavily on KenPom and team quality.",
  },
  "1v3": {
    upsetRate: 0.33,
    note: "1-seeds win ~67% of Elite Eight games against 3-seeds.",
    upsetInstruction: "Favor the 1-seed slightly, but 3-seeds at this stage are dangerous.",
  },
};

/** Get matchup key for seed pair (e.g. "5v12", "8v9") */
export function getMatchupKey(seed1: number, seed2: number): string {
  const higher = Math.min(seed1, seed2);
  const lower = Math.max(seed1, seed2);
  return `${higher}v${lower}`;
}
