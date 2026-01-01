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

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {!data && !error && <div className="text-sm text-gray-600">Loading…</div>}

      {data && (
  <>
    {(() => {
      const anyData: any = data;

      const profile = Number(anyData?.profile_completeness ?? 0);
      const avg = Number(anyData?.average_match_score ?? anyData?.avg_match_score ?? 0);
      const resumeCount = Number(anyData?.resume_count ?? 0);

      const history = Array.isArray(anyData?.match_history) ? anyData.match_history : [];
      const chartData = history
        .map((h: any) => ({
          timestamp: h?.timestamp ?? h?.created_at ?? "",
          match_score: Number(h?.match_score ?? h?.score ?? 0),
        }))
        .filter((d: any) => d.timestamp);

      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard title="Profile completeness" value={`${profile.toFixed(0)}%`} />
            <ScoreCard title="Average match score" value={`${avg.toFixed(1)} / 100`} />
            <ScoreCard title="Resumes parsed" value={`${resumeCount}`} />
          </div>

          <MatchHistoryChart data={chartData} />
        </>
      );
    })()}
  </>
)}
    </main>
  );
}