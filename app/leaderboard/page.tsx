import { getLeaderboardStats } from "@/lib/leaderboard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard",
  description:
    "Aggregated results from thousands of AI-simulated NCAA tournament brackets. See which teams win most often.",
};

export default async function LeaderboardPage() {
  const data = await getLeaderboardStats();

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#121213] leading-tight">
              Tournament Leaderboard
            </h1>
            <p className="text-[14px] text-[#6c6e6f] mt-1">
              Aggregated results from{" "}
              <span className="font-semibold text-[#121213] tabular-nums">
                {data.totalSimulations.toLocaleString()}
              </span>{" "}
              simulations
            </p>
          </div>
        </div>

        {data.totalSimulations === 0 ? (
          <div className="bg-white rounded-lg border border-[#dcdddf] p-12 text-center">
            <p className="text-[16px] text-[#6c6e6f]">
              No simulations yet. Run some simulations from the bracket page to
              see results here.
            </p>
          </div>
        ) : (
          <>
            <Insights data={data} />
            <LeaderboardTable data={data} />
          </>
        )}
      </div>
    </div>
  );
}

function Insights({
  data,
}: {
  data: Awaited<ReturnType<typeof getLeaderboardStats>>;
}) {
  const { totalSimulations, teams } = data;
  if (teams.length === 0) return null;

  const topChampion = [...teams].sort((a, b) => b.champion - a.champion)[0];
  const bestCinderella = [...teams]
    .filter((t) => t.seed >= 10)
    .sort((a, b) => b.finalFour - a.finalFour)[0];
  const biggestBust = [...teams]
    .filter((t) => t.seed <= 2)
    .sort((a, b) => a.champion - b.champion)[0];
  const upsetKing = [...teams].sort((a, b) => b.upsetWins - a.upsetWins)[0];

  const pct = (n: number) => ((n / totalSimulations) * 100).toFixed(1);

  const insights = [
    {
      label: "Most Likely Champion",
      value: `(${topChampion.seed}) ${topChampion.teamName}`,
      stat: `${pct(topChampion.champion)}%`,
    },
    bestCinderella && bestCinderella.finalFour > 0
      ? {
          label: "Best Cinderella",
          value: `(${bestCinderella.seed}) ${bestCinderella.teamName}`,
          stat: `${pct(bestCinderella.finalFour)}% FF`,
        }
      : null,
    biggestBust
      ? {
          label: "Biggest Bust",
          value: `(${biggestBust.seed}) ${biggestBust.teamName}`,
          stat: `${pct(biggestBust.champion)}% champ`,
        }
      : null,
    upsetKing
      ? {
          label: "Upset King",
          value: `(${upsetKing.seed}) ${upsetKing.teamName}`,
          stat: `${upsetKing.upsetWins.toLocaleString()} upset wins`,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {insights.map((insight) => (
        <div
          key={insight!.label}
          className="bg-white rounded-lg border border-[#dcdddf] p-4"
        >
          <div className="text-[10px] uppercase tracking-wider text-[#6c6e6f] mb-1">
            {insight!.label}
          </div>
          <div className="text-[14px] font-semibold text-[#121213] truncate">
            {insight!.value}
          </div>
          <div className="text-[12px] text-[#6c6e6f] font-mono tabular-nums">
            {insight!.stat}
          </div>
        </div>
      ))}
    </div>
  );
}
