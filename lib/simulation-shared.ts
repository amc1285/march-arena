import type { Bracket, Game, Region, Team } from "@/lib/bracket-data";
import { placeholderGame } from "@/lib/bracket-data";

// Maps First Four game index to (regionIndex, round0GameIndex, teamSlot)
/** Order matches `BRACKET_2026.firstFour` indices (NCAA.com 2026). */
export const FIRST_FOUR_SLOTS: Array<{ region: number; gameIndex: number; slot: 1 | 2 }> = [
  { region: 0, gameIndex: 0, slot: 2 }, // UMBC/Howard -> South (Florida opponent)
  { region: 3, gameIndex: 4, slot: 2 }, // Texas/NC State -> Midwest (Tennessee opponent)
  { region: 3, gameIndex: 0, slot: 2 }, // Prairie View/Lehigh -> Midwest (Michigan opponent)
  { region: 2, gameIndex: 4, slot: 2 }, // Miami OH/SMU -> West (BYU opponent)
];

// Simulation stages for region-by-region flow
export type SimulationStage =
  | "first-four"
  | "south"
  | "east"
  | "west"
  | "midwest"
  | "finals";

export type SimulationProgress = Bracket & {
  winner?: Team;
  currentStage?: SimulationStage;
  completedStages?: SimulationStage[];
};

/** Placeholder rounds from `startRound` onward (inclusive). */
export function placeholderRoundsFrom(
  region: Region,
  startRound: number
): Game[][] {
  return region.rounds.slice(startRound).map((round) =>
    round.map((g) => placeholderGame(g.id))
  );
}

/** Stream payload: explicit rounds (scheduled / in_progress / final), not all TBD. */
export function buildWorkflowStreamPayload(
  bracket: Bracket,
  firstFourDisplay: Game[],
  regionRounds: Game[][][],
  finalFourGames: Game[],
  championshipGame: Game,
  currentStage?: SimulationStage,
  completedStages?: SimulationStage[]
): SimulationProgress {
  const regions: Region[] = bracket.regions.map((region, ri) => ({
    ...region,
    rounds: regionRounds[ri],
  }));
  const result: SimulationProgress = {
    year: bracket.year,
    schedule: bracket.schedule,
    firstFour: firstFourDisplay,
    regions,
    finalFour: finalFourGames,
    championship: championshipGame,
  };
  if (currentStage) result.currentStage = currentStage;
  if (completedStages) result.completedStages = completedStages;
  return result;
}
