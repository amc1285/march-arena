import type { SimulatedBracket, Team } from "@/lib/bracket-data";
import { BRACKET_2026 } from "@/lib/bracket-data";
import { getRedis } from "@/lib/redis";

const LEADERBOARD_KEY = "leaderboard";

// ── Types ──────────────────────────────────────────────────────────

export interface TeamLeaderboardStats {
  teamId: number;
  teamName: string;
  seed: number;
  region: string;
  conference: string;
  champion: number;
  championship: number; // appeared in championship game
  finalFour: number;
  elite8: number;
  sweet16: number;
  round32: number;
  totalWins: number;
  totalGames: number;
  upsetWins: number;
  upsetLosses: number;
}

export interface LeaderboardData {
  totalSimulations: number;
  teams: TeamLeaderboardStats[];
}

// ── Extract results from a completed bracket ───────────────────────

interface TeamResult {
  wins: number;
  games: number;
  upsetWins: number;
  upsetLosses: number;
  furthestRound: number; // 0=lost R64, 1=R32, 2=S16, 3=E8, 4=FF, 5=championship game, 6=champion
}

export function extractTeamResults(
  bracket: SimulatedBracket
): Map<number, TeamResult> {
  const results = new Map<number, TeamResult>();

  function ensureTeam(team: Team): TeamResult {
    if (!results.has(team.id)) {
      results.set(team.id, {
        wins: 0,
        games: 0,
        upsetWins: 0,
        upsetLosses: 0,
        furthestRound: 0,
      });
    }
    return results.get(team.id)!;
  }

  function recordGame(
    winner: Team,
    loser: Team,
    roundLevel: number
  ) {
    const w = ensureTeam(winner);
    const l = ensureTeam(loser);

    w.wins++;
    w.games++;
    l.games++;

    // Update furthest round for winner
    w.furthestRound = Math.max(w.furthestRound, roundLevel);

    // Check for upset (higher seed number = lower seed = underdog)
    if (winner.seed > loser.seed) {
      w.upsetWins++;
      l.upsetLosses++;
    }
  }

  // First Four (roundLevel 0 - just counts as a game, winner enters R64)
  for (const game of bracket.firstFour) {
    if (game.winner && game.team1.seed > 0 && game.team2.seed > 0) {
      const winner = game.winner === 1 ? game.team1 : game.team2;
      const loser = game.winner === 1 ? game.team2 : game.team1;
      recordGame(winner, loser, 0);
    }
  }

  // Regional rounds
  // Round index 0 = R64, 1 = R32, 2 = S16, 3 = E8
  // roundLevel: winning R64 = 1 (made R32), winning R32 = 2 (made S16), etc.
  for (const region of bracket.regions) {
    for (let roundIdx = 0; roundIdx < region.rounds.length; roundIdx++) {
      const round = region.rounds[roundIdx];
      for (const game of round) {
        if (game.winner && game.team1.seed > 0 && game.team2.seed > 0) {
          const winner = game.winner === 1 ? game.team1 : game.team2;
          const loser = game.winner === 1 ? game.team2 : game.team1;
          recordGame(winner, loser, roundIdx + 1); // R64 win = 1, R32 win = 2, S16 win = 3, E8 win = 4
        }
      }
    }
  }

  // Final Four (roundLevel 5 = made championship game)
  for (const game of bracket.finalFour) {
    if (game.winner && game.team1.seed > 0 && game.team2.seed > 0) {
      const winner = game.winner === 1 ? game.team1 : game.team2;
      const loser = game.winner === 1 ? game.team2 : game.team1;
      recordGame(winner, loser, 5);
    }
  }

  // Championship (roundLevel 6 = champion)
  if (
    bracket.championship &&
    bracket.championship.winner &&
    bracket.championship.team1.seed > 0 &&
    bracket.championship.team2.seed > 0
  ) {
    const winner =
      bracket.championship.winner === 1
        ? bracket.championship.team1
        : bracket.championship.team2;
    const loser =
      bracket.championship.winner === 1
        ? bracket.championship.team2
        : bracket.championship.team1;
    recordGame(winner, loser, 6);
  }

  return results;
}

// ── Save simulation results to Redis ───────────────────────────────

export async function saveSimulationResults(
  bracket: SimulatedBracket
): Promise<void> {
  const redis = getRedis();
  const teamResults = extractTeamResults(bracket);
  const pipeline = redis.pipeline();

  pipeline.hincrby(LEADERBOARD_KEY, "total", 1);

  for (const [teamId, result] of teamResults) {
    const prefix = `${teamId}`;
    pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:w`, result.wins);
    pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:g`, result.games);
    pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:uw`, result.upsetWins);
    pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:ul`, result.upsetLosses);

    if (result.furthestRound >= 1)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:r32`, 1);
    if (result.furthestRound >= 2)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:s16`, 1);
    if (result.furthestRound >= 3)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:e8`, 1);
    if (result.furthestRound >= 4)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:ff`, 1);
    if (result.furthestRound >= 5)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:cg`, 1); // championship game
    if (result.furthestRound >= 6)
      pipeline.hincrby(LEADERBOARD_KEY, `${prefix}:ch`, 1); // champion
  }

  await pipeline.exec();
}

// ── Read leaderboard stats from Redis ──────────────────────────────

export async function getLeaderboardStats(): Promise<LeaderboardData> {
  const redis = getRedis();
  const raw = await redis.hgetall(LEADERBOARD_KEY);

  if (!raw || Object.keys(raw).length === 0) {
    return { totalSimulations: 0, teams: [] };
  }

  const totalSimulations = parseInt(raw["total"] ?? "0", 10);

  const teamMeta = new Map<
    number,
    { name: string; seed: number; region: string; conference: string }
  >();

  for (const region of BRACKET_2026.regions) {
    for (const round of region.rounds) {
      for (const game of round) {
        for (const team of [game.team1, game.team2]) {
          if (team.id > 0 && !teamMeta.has(team.id)) {
            teamMeta.set(team.id, {
              name: team.name,
              seed: team.seed,
              region: region.name,
              conference: team.conference ?? "Other",
            });
          }
        }
      }
    }
  }
  // Also include First Four teams
  for (const game of BRACKET_2026.firstFour) {
    for (const team of [game.team1, game.team2]) {
      if (team.id > 0 && !teamMeta.has(team.id)) {
        teamMeta.set(team.id, {
          name: team.name,
          seed: team.seed,
          region: "FIRST FOUR",
          conference: team.conference ?? "Other",
        });
      }
    }
  }

  // Parse per-team stats from Redis hash
  const teams: TeamLeaderboardStats[] = [];
  const seenIds = new Set<number>();

  for (const key of Object.keys(raw)) {
    const match = key.match(/^(\d+):/);
    if (!match) continue;
    const teamId = parseInt(match[1], 10);
    if (seenIds.has(teamId)) continue;
    seenIds.add(teamId);

    const meta = teamMeta.get(teamId);
    if (!meta) continue;

    const prefix = `${teamId}`;
    teams.push({
      teamId,
      teamName: meta.name,
      seed: meta.seed,
      region: meta.region,
      conference: meta.conference,
      champion: parseInt(raw[`${prefix}:ch`] ?? "0", 10),
      championship: parseInt(raw[`${prefix}:cg`] ?? "0", 10),
      finalFour: parseInt(raw[`${prefix}:ff`] ?? "0", 10),
      elite8: parseInt(raw[`${prefix}:e8`] ?? "0", 10),
      sweet16: parseInt(raw[`${prefix}:s16`] ?? "0", 10),
      round32: parseInt(raw[`${prefix}:r32`] ?? "0", 10),
      totalWins: parseInt(raw[`${prefix}:w`] ?? "0", 10),
      totalGames: parseInt(raw[`${prefix}:g`] ?? "0", 10),
      upsetWins: parseInt(raw[`${prefix}:uw`] ?? "0", 10),
      upsetLosses: parseInt(raw[`${prefix}:ul`] ?? "0", 10),
    });
  }

  teams.sort(
    (a, b) =>
      b.totalWins - a.totalWins ||
      b.champion - a.champion ||
      a.teamId - b.teamId
  );

  return { totalSimulations, teams };
}
