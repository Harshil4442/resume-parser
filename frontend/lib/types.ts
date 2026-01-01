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
