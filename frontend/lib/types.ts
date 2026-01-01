export type ResumeParseResponse = {
  resume_id: number;
  skills: string[];
  experience_years: number;
  sections: Record<string, string>;
};

export type MatchHistoryItem = {
  created_at: string; // ISO datetime
  score: number;      // 0..100
};

export type AnalyticsSummary = {
  profile_completeness: number;
  average_match_score: number;
  resume_count: number;
  jd_count: number;
  applications_count: number;
  match_history: MatchHistoryItem[];
};

// Chart format (convert at call-site)
export type MatchHistoryChartPoint = {
  timestamp: string;
  match_score: number;
};