"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { getTeamLogoUrl } from "@/lib/bracket-data";
import type { LeaderboardData, TeamLeaderboardStats } from "@/lib/leaderboard";

type SortKey =
  | "champion"
  | "finalFour"
  | "elite8"
  | "sweet16"
  | "winPct"
  | "upsetWins"
  | "seed";

interface Props {
  data: LeaderboardData;
}

export function LeaderboardTable({ data }: Props) {
  const { totalSimulations, teams } = data;
  const [sortKey, setSortKey] = useState<SortKey>("winPct");
  const [sortAsc, setSortAsc] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [seedFilter, setSeedFilter] = useState<string>("ALL");
  const [conferenceFilter, setConferenceFilter] = useState<string>("ALL");

  const conferences = useMemo(() => {
    const set = new Set(teams.map((t) => t.conference));
    return ["ALL", ...Array.from(set).sort()];
  }, [teams]);

  const regions = useMemo(() => {
    const set = new Set(teams.map((t) => t.region));
    return ["ALL", ...Array.from(set).sort()];
  }, [teams]);

  const filteredAndSorted = useMemo(() => {
    let result = [...teams];

    if (regionFilter !== "ALL") {
      result = result.filter((t) => t.region === regionFilter);
    }
    if (seedFilter !== "ALL") {
      const [min, max] = seedFilter.split("-").map(Number);
      result = result.filter((t) => t.seed >= min && t.seed <= max);
    }
    if (conferenceFilter !== "ALL") {
      result = result.filter((t) => t.conference === conferenceFilter);
    }

    result.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "champion":
          av = a.champion;
          bv = b.champion;
          break;
        case "finalFour":
          av = a.finalFour;
          bv = b.finalFour;
          break;
        case "elite8":
          av = a.elite8;
          bv = b.elite8;
          break;
        case "sweet16":
          av = a.sweet16;
          bv = b.sweet16;
          break;
        case "winPct":
          av = a.totalGames > 0 ? a.totalWins / a.totalGames : 0;
          bv = b.totalGames > 0 ? b.totalWins / b.totalGames : 0;
          break;
        case "upsetWins":
          av = a.upsetWins;
          bv = b.upsetWins;
          break;
        case "seed":
          av = a.seed;
          bv = b.seed;
          break;
        default:
          av = a.champion;
          bv = b.champion;
      }
      const primary = sortAsc ? av - bv : bv - av;
      if (primary !== 0) return primary;
      const byWins = b.totalWins - a.totalWins;
      if (byWins !== 0) return byWins;
      return a.teamId - b.teamId;
    });

    return result;
  }, [teams, sortKey, sortAsc, regionFilter, seedFilter, conferenceFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const pct = (n: number) => ((n / totalSimulations) * 100).toFixed(1);

  const maxWinPct = Math.max(
    ...teams.map((t) => (t.totalGames > 0 ? t.totalWins / t.totalGames : 0)),
    0.01
  );

  return (
    <div className="bg-white rounded-lg border border-[#dcdddf] overflow-hidden">
      <div className="flex flex-wrap gap-3 p-4 border-b border-[#dcdddf] bg-[#fafafa]">
        <FilterSelect
          label="Region"
          value={regionFilter}
          onChange={setRegionFilter}
          options={regions}
        />
        <FilterSelect
          label="Seed"
          value={seedFilter}
          onChange={setSeedFilter}
          options={["ALL", "1-4", "5-8", "9-12", "13-16"]}
        />
        <FilterSelect
          label="Conference"
          value={conferenceFilter}
          onChange={setConferenceFilter}
          options={conferences}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#dcdddf] text-[10px] uppercase tracking-wider text-[#6c6e6f]">
              <th className="px-4 py-3 w-10 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors hidden sm:table-cell"
                onClick={() => toggleSort("seed")}
              >
                Seed {sortKey === "seed" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right"
                onClick={() => toggleSort("winPct")}
              >
                Total Win%{" "}
                {sortKey === "winPct" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right hidden sm:table-cell"
                onClick={() => toggleSort("champion")}
              >
                Champ.{" "}
                {sortKey === "champion" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right hidden md:table-cell"
                onClick={() => toggleSort("finalFour")}
              >
                FF% {sortKey === "finalFour" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right hidden md:table-cell"
                onClick={() => toggleSort("elite8")}
              >
                E8% {sortKey === "elite8" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right hidden lg:table-cell"
                onClick={() => toggleSort("sweet16")}
              >
                S16%{" "}
                {sortKey === "sweet16" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-3 py-3 font-medium cursor-pointer hover:text-[#121213] transition-colors text-right hidden lg:table-cell"
                onClick={() => toggleSort("upsetWins")}
              >
                Upsets{" "}
                {sortKey === "upsetWins" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((team, idx) => (
              <TeamRow
                key={team.teamId}
                team={team}
                rank={idx + 1}
                maxWinPct={maxWinPct}
                pct={pct}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="p-8 text-center text-[14px] text-[#6c6e6f]">
          No teams match the current filters.
        </div>
      )}
    </div>
  );
}

// ── Team Row ───────────────────────────────────────────────────────

function TeamRow({
  team,
  rank,
  maxWinPct,
  pct,
}: {
  team: TeamLeaderboardStats;
  rank: number;
  maxWinPct: number;
  pct: (n: number) => string;
}) {
  const winRate = team.totalGames > 0 ? team.totalWins / team.totalGames : 0;
  const winPct = (winRate * 100).toFixed(1);
  const winBarWidth = (winRate / maxWinPct) * 100;

  return (
    <tr className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
      <td className="px-4 py-3 text-[12px] text-[#6c6e6f] font-mono tabular-nums">
        {rank}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 shrink-0">
            <TeamLogo teamId={team.teamId} name={team.teamName} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[#121213] truncate">
              <span className="sm:hidden text-[#6c6e6f] font-normal mr-1">
                ({team.seed})
              </span>
              {team.teamName}
            </div>
            <div className="text-[10px] text-[#9a9c9e] truncate hidden sm:block">
              {team.conference} &middot; {team.region}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-[13px] text-[#6c6e6f] tabular-nums hidden sm:table-cell">
        {team.seed}
      </td>

      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <div
            className="h-[6px] rounded-full bg-[#121213] opacity-15 hidden sm:block"
            style={{
              width: `${Math.round(winBarWidth * 0.6)}px`,
              minWidth: winRate > 0 ? "2px" : 0,
            }}
          />
          <span className="text-[13px] font-semibold text-[#121213] tabular-nums font-mono">
            {winPct}%
          </span>
        </div>
      </td>

      <td className="px-3 py-3 text-right text-[13px] text-[#6c6e6f] tabular-nums font-mono hidden sm:table-cell">
        {pct(team.champion)}%
      </td>

      <td className="px-3 py-3 text-right text-[13px] text-[#4a4b4d] tabular-nums font-mono hidden md:table-cell">
        {pct(team.finalFour)}%
      </td>

      <td className="px-3 py-3 text-right text-[13px] text-[#4a4b4d] tabular-nums font-mono hidden md:table-cell">
        {pct(team.elite8)}%
      </td>

      <td className="px-3 py-3 text-right text-[13px] text-[#6c6e6f] tabular-nums font-mono hidden lg:table-cell">
        {pct(team.sweet16)}%
      </td>

      <td className="px-3 py-3 text-right text-[13px] text-[#6c6e6f] tabular-nums font-mono hidden lg:table-cell">
        {team.upsetWins.toLocaleString()}
      </td>
    </tr>
  );
}

// ── Team Logo with error fallback ──────────────────────────────────

function TeamLogo({ teamId, name }: { teamId: number; name: string }) {
  const [error, setError] = useState(false);

  if (error || teamId <= 0) {
    return (
      <div className="w-6 h-6 rounded bg-[#e0e0e0] flex items-center justify-center text-[8px] font-bold text-[#6c6e6f]">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={getTeamLogoUrl(teamId, 48)}
      alt={name}
      width={24}
      height={24}
      className="object-contain"
      onError={() => setError(true)}
    />
  );
}

// ── Filter Select ──────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[10px] uppercase tracking-wider text-[#6c6e6f] font-medium">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[12px] bg-white border border-[#dcdddf] rounded px-2 py-1 text-[#121213] outline-none focus:border-[#121213] transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "ALL" ? `All ${label}s` : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
