/**
 * Seed the leaderboard with thousands of realistic probability-based simulations.
 *
 * Usage:
 *   pnpm tsx scripts/seed-leaderboard.ts [count]
 *
 * Requires REDIS_URL in .env.local (loaded via dotenv inline).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import Redis from "ioredis";

// ── Load .env.local manually (no Next.js runtime) ─────────────────

const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local may not exist
}

// ── Inline types (avoid @/ import issues outside Next.js) ──────────

interface Team {
  id: number;
  name: string;
  abbreviation: string;
  seed: number;
  conference?: string;
  teamTier?: "blueblood" | "power" | "mid-major" | "low-major";
}

interface Game {
  id: string;
  status: "scheduled" | "in_progress" | "final";
  team1: Team;
  team2: Team;
  winner?: 1 | 2;
}

interface Region {
  name: string;
  rounds: Game[][];
}

interface Bracket {
  year: number;
  regions: Region[];
  finalFour: Game[];
  championship: Game | null;
  firstFour: Game[];
}

// ── Seed matchup probabilities (higher seed win rate) ──────────────

const SEED_WIN_RATES: Record<string, number> = {
  "1v16": 0.988,
  "2v15": 0.931,
  "3v14": 0.856,
  "4v13": 0.794,
  "5v12": 0.64,
  "6v11": 0.638,
  "7v10": 0.625,
  "8v9": 0.48,
};

// Team tier bonuses for later rounds
const TIER_BONUS: Record<string, number> = {
  blueblood: 0.06,
  power: 0.02,
  "mid-major": -0.03,
  "low-major": -0.06,
};

function getMatchupKey(seed1: number, seed2: number): string {
  const higher = Math.min(seed1, seed2);
  const lower = Math.max(seed1, seed2);
  return `${higher}v${lower}`;
}

/**
 * Calculate win probability for team1 vs team2.
 * Uses historical seed matchup data + team tier adjustments.
 * For later-round matchups without historical data, uses seed difference.
 */
function winProbability(team1: Team, team2: Team, roundIdx: number): number {
  const key = getMatchupKey(team1.seed, team2.seed);
  const baseRate = SEED_WIN_RATES[key];

  if (baseRate !== undefined) {
    // baseRate is the probability that the higher seed wins
    const team1IsHigherSeed = team1.seed <= team2.seed;
    let prob = team1IsHigherSeed ? baseRate : 1 - baseRate;

    // Apply tier bonuses
    const t1Bonus = TIER_BONUS[team1.teamTier ?? ""] ?? 0;
    const t2Bonus = TIER_BONUS[team2.teamTier ?? ""] ?? 0;
    prob += t1Bonus - t2Bonus;

    // Later rounds: experience matters more
    if (roundIdx >= 2) {
      prob += (t1Bonus - t2Bonus) * 0.5;
    }

    return Math.max(0.05, Math.min(0.95, prob));
  }

  // Later round matchup: use seed-based probability with diminishing effect
  const seedDiff = team2.seed - team1.seed; // positive = team1 is higher seed
  let prob = 0.5 + seedDiff * 0.02; // slight edge per seed difference

  // Tier adjustments matter more in later rounds
  const t1Bonus = TIER_BONUS[team1.teamTier ?? ""] ?? 0;
  const t2Bonus = TIER_BONUS[team2.teamTier ?? ""] ?? 0;
  prob += (t1Bonus - t2Bonus) * (1 + roundIdx * 0.3);

  return Math.max(0.15, Math.min(0.85, prob));
}

// ── Simulate one full tournament ───────────────────────────────────

function simulateOnce(bracket: Bracket): SimResult {
  const teamResults = new Map<number, TeamResultData>();

  function ensureTeam(team: Team) {
    if (!teamResults.has(team.id)) {
      teamResults.set(team.id, {
        wins: 0,
        games: 0,
        upsetWins: 0,
        upsetLosses: 0,
        furthestRound: 0,
      });
    }
    return teamResults.get(team.id)!;
  }

  function playGame(
    team1: Team,
    team2: Team,
    roundLevel: number
  ): { winner: Team; loser: Team } {
    const prob = winProbability(team1, team2, roundLevel);
    const team1Wins = Math.random() < prob;
    const winner = team1Wins ? team1 : team2;
    const loser = team1Wins ? team2 : team1;

    const w = ensureTeam(winner);
    const l = ensureTeam(loser);
    w.wins++;
    w.games++;
    l.games++;
    w.furthestRound = Math.max(w.furthestRound, roundLevel);

    if (winner.seed > loser.seed) {
      w.upsetWins++;
      l.upsetLosses++;
    }

    return { winner, loser };
  }

  // First Four
  const firstFourSlots: Array<{
    region: number;
    gameIndex: number;
    slot: 1 | 2;
  }> = [
    { region: 0, gameIndex: 0, slot: 2 },
    { region: 3, gameIndex: 4, slot: 2 },
    { region: 3, gameIndex: 0, slot: 2 },
    { region: 2, gameIndex: 4, slot: 2 },
  ];

  const firstFourWinners: Team[] = [];
  for (const game of bracket.firstFour) {
    if (game.team1.id > 0 && game.team2.id > 0) {
      const { winner } = playGame(game.team1, game.team2, 0);
      firstFourWinners.push(winner);
    }
  }

  // Build Round of 64 with First Four winners injected
  const regionTeams: Team[][][] = bracket.regions.map((region, regionIdx) => {
    const games: [Team, Team][] = region.rounds[0].map((g) => [
      { ...g.team1 },
      { ...g.team2 },
    ]);

    firstFourSlots.forEach((slot, ffIdx) => {
      if (slot.region === regionIdx && firstFourWinners[ffIdx]) {
        if (slot.slot === 1) {
          games[slot.gameIndex][0] = firstFourWinners[ffIdx];
        } else {
          games[slot.gameIndex][1] = firstFourWinners[ffIdx];
        }
      }
    });

    return games;
  });

  // Simulate region rounds
  const regionWinners: Team[] = [];
  for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
    let currentMatchups = regionTeams[regionIdx];

    for (let roundIdx = 0; roundIdx < 4; roundIdx++) {
      const roundLevel = roundIdx + 1;
      const nextMatchups: [Team, Team][] = [];
      const winners: Team[] = [];

      for (const [t1, t2] of currentMatchups) {
        if (t1.id > 0 && t2.id > 0) {
          const { winner } = playGame(t1, t2, roundLevel);
          winners.push(winner);
        }
      }

      // Pair winners for next round
      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          nextMatchups.push([winners[i], winners[i + 1]]);
        }
      }
      currentMatchups = nextMatchups;

      if (roundIdx === 3 && winners.length > 0) {
        regionWinners.push(winners[0]);
      }
    }
  }

  // Final Four: South(0) vs West(2), East(1) vs Midwest(3)
  let champion: Team | null = null;
  if (regionWinners.length === 4) {
    const { winner: ff1Winner } = playGame(
      regionWinners[0],
      regionWinners[2],
      5
    );
    const { winner: ff2Winner } = playGame(
      regionWinners[1],
      regionWinners[3],
      5
    );

    // Championship
    const { winner: champ } = playGame(ff1Winner, ff2Winner, 6);
    champion = champ;
  }

  return { teamResults, champion };
}

interface TeamResultData {
  wins: number;
  games: number;
  upsetWins: number;
  upsetLosses: number;
  furthestRound: number;
}

interface SimResult {
  teamResults: Map<number, TeamResultData>;
  champion: Team | null;
}

// ── Main: run simulations and write to Redis ───────────────────────

async function main() {
  const count = parseInt(process.argv[2] ?? "5000", 10);
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error("REDIS_URL not found in .env.local");
    process.exit(1);
  }

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  console.log(`Connected to Redis. Running ${count} simulations...`);

  // Clear existing leaderboard data
  await redis.del("leaderboard");

  const bracketModule = await import("../lib/bracket-data");
  const bracket = bracketModule.BRACKET_2026 as unknown as Bracket;

  const BATCH_SIZE = 500;
  let completed = 0;

  for (let batch = 0; batch < count; batch += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - batch);
    const pipeline = redis.pipeline();

    for (let i = 0; i < batchCount; i++) {
      const { teamResults } = simulateOnce(bracket);

      pipeline.hincrby("leaderboard", "total", 1);

      for (const [teamId, result] of teamResults) {
        const p = `${teamId}`;
        pipeline.hincrby("leaderboard", `${p}:w`, result.wins);
        pipeline.hincrby("leaderboard", `${p}:g`, result.games);
        pipeline.hincrby("leaderboard", `${p}:uw`, result.upsetWins);
        pipeline.hincrby("leaderboard", `${p}:ul`, result.upsetLosses);

        if (result.furthestRound >= 1)
          pipeline.hincrby("leaderboard", `${p}:r32`, 1);
        if (result.furthestRound >= 2)
          pipeline.hincrby("leaderboard", `${p}:s16`, 1);
        if (result.furthestRound >= 3)
          pipeline.hincrby("leaderboard", `${p}:e8`, 1);
        if (result.furthestRound >= 4)
          pipeline.hincrby("leaderboard", `${p}:ff`, 1);
        if (result.furthestRound >= 5)
          pipeline.hincrby("leaderboard", `${p}:cg`, 1);
        if (result.furthestRound >= 6)
          pipeline.hincrby("leaderboard", `${p}:ch`, 1);
      }
    }

    await pipeline.exec();
    completed += batchCount;
    const pct = Math.round((completed / count) * 100);
    process.stdout.write(`\r  Progress: ${completed}/${count} (${pct}%)`);
  }

  console.log("\n  Done! Verifying...");

  // Quick verification
  const total = await redis.hget("leaderboard", "total");
  console.log(`  Total simulations in Redis: ${total}`);

  // Show top 10
  const allData = await redis.hgetall("leaderboard");
  const teamIds = new Set<number>();
  for (const key of Object.keys(allData)) {
    const match = key.match(/^(\d+):/);
    if (match) teamIds.add(parseInt(match[1], 10));
  }

  // Build team name lookup from bracket
  const teamNames = new Map<number, { name: string; seed: number }>();
  for (const region of bracket.regions) {
    for (const round of region.rounds) {
      for (const game of round) {
        for (const team of [game.team1, game.team2]) {
          if (team.id > 0) teamNames.set(team.id, { name: team.name, seed: team.seed });
        }
      }
    }
  }
  for (const game of bracket.firstFour) {
    for (const team of [game.team1, game.team2]) {
      if (team.id > 0) teamNames.set(team.id, { name: team.name, seed: team.seed });
    }
  }

  const rankings: Array<{ name: string; seed: number; champ: number }> = [];
  for (const teamId of teamIds) {
    const meta = teamNames.get(teamId);
    if (!meta) continue;
    rankings.push({
      name: meta.name,
      seed: meta.seed,
      champ: parseInt(allData[`${teamId}:ch`] ?? "0", 10),
    });
  }
  rankings.sort((a, b) => b.champ - a.champ);

  console.log("\n  Top 10 Championship Winners:");
  console.log("  ─────────────────────────────────");
  for (let i = 0; i < Math.min(10, rankings.length); i++) {
    const r = rankings[i];
    const pct = ((r.champ / parseInt(total!, 10)) * 100).toFixed(1);
    console.log(
      `  ${String(i + 1).padStart(2)}. (${r.seed}) ${r.name.padEnd(20)} ${pct}% (${r.champ})`
    );
  }

  await redis.quit();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
