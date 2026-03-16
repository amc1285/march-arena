# March Madness AI

An AI-powered NCAA Tournament bracket simulator built with Next.js and Claude Haiku. **Production** (e.g. marcharena.com): sim API + full sim UI are off. **`pnpm dev` locally**: both are on so the game works after clone + API key.

Site: https://www.marcharena.com (bracket + “View the code”; no hosted sim).

## How It Works (local / fork)

1. **Configure an Anthropic API key** — required to call the model from your machine
2. **Run `pnpm dev`** — sim UI + `/api/simulate` are on in development. Set `SIMULATE_TEMPORARILY_DISABLED = true` in `lib/simulate-gate.ts` to turn sim off locally. For `next start`, use `SIMULATE_ENABLED` + `NEXT_PUBLIC_SIMULATE_ENABLED`. Or `pnpm ai-sim-batch` / `simulateBracketLocally`
3. **Each pick uses Claude (Haiku-class)** — team profiles, KenPom stats, venue/travel context, historical seed matchup records (1985–2025), and upset indicators → structured `{ winner, reasoning }`
4. **Win probabilities** — ensemble of KenPom logistic (60%), Log5 (25%), and seed-based (15%) models
5. **Leaderboard (optional)** — Redis-backed aggregation when you run sims that call `saveSimulationResults`

## Stack

- **Next.js 16** (App Router) + **React 19**
- **AI SDK** + **Anthropic** for structured game picks (BYOK)
- **Redis** (ioredis) for leaderboard persistence
- **Tailwind CSS 4** for styling
- **Vercel Firewall** for rate limiting (when sim API is enabled)
