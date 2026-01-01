"use client";

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "../../lib/types";
import { apiGet } from "../../lib/api";
import ScoreCard from "../../components/ScoreCard";
import MatchHistoryChart from "../../components/MatchHistoryChart";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet<AnalyticsSummary>("/analytics/summary")
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e?.message || "Failed to load dashboard"));
    return () => {
      mounted = false;
    };
  }, []);

  const avg = Number((data as any)?.average_match_score);
  const avgText = Number.isFinite(avg) ? `${avg.toFixed(1)} / 100` : "—";

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {!data && !error && <div className="text-sm text-gray-600">Loading…</div>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard title="Profile completeness" value={`${(data as any)?.profile_completeness ?? 0}%`} />
            <ScoreCard title="Average match score" value={avgText} />
            <ScoreCard title="Resumes parsed" value={`${(data as any)?.resume_count ?? 0}`} />
          </div>

          <MatchHistoryChart
            data={((data as any)?.match_history || []).map((h: any) => ({
              timestamp: h.created_at || h.timestamp || new Date().toISOString(),
              match_score: Number(h.score ?? h.match_score ?? 0),
            }))}
          />
        </>
      )}
    </main>
  );
}