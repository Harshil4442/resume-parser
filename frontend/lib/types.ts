export type ResumeParseResponse = {
  resume_id: number;
  skills: string[];
  experience_years: number;
  sections: Record<string, string>;
};

export type MatchHistoryPoint = { timestamp: string; match_score: number };

export type DashboardSummary = {
  profile_completeness: number;
  avg_match_score: number;
  applications_count: number;
  match_history: MatchHistoryPoint[];
};

export type Course = {
  title: string;
  platform: string;
  url: string;
  skill: string;
};

export type GapAnalysisResponse = {
  current_skills: string[];
  skill_gaps: string[];
  recommended_courses: Course[];
};

export type MatchHistoryItem = {
  timestamp: string;      // ISO string
  match_score: number;    // 0..100
};

export type AnalyticsSummary = {
  profile_completeness: number;
  average_match_score: number;
  resume_count: number;
  jd_count: number;
  applications_count: number;
  match_history: MatchHistoryItem[];
};