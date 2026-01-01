import json
from pathlib import Path
from typing import List, Tuple, Dict

ROOT = Path(__file__).resolve().parents[2]
COURSES_PATH = ROOT / "resources" / "courses.json"

def _load_courses() -> List[Dict]:
    try:
        return json.loads(COURSES_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []

COURSES = _load_courses()

ROLE_SKILLS = {
    "Software Engineer": ["python", "javascript", "git", "data structures", "system design", "sql", "testing"],
    "Backend Engineer": ["python", "fastapi", "django", "sql", "postgresql", "redis", "docker", "oauth", "jwt", "testing"],
    "Frontend Engineer": ["javascript", "typescript", "react", "next.js", "html", "css", "tailwind", "testing"],
    "DevOps Engineer": ["linux", "docker", "kubernetes", "ci/cd", "terraform", "observability", "cloud run", "aws", "gcp"],
    "Data Scientist": ["python", "numpy", "pandas", "sql", "machine learning", "statistics", "visualization"],
    "ML Engineer": ["python", "machine learning", "pytorch", "tensorflow", "nlp", "docker", "kubernetes", "gcp"],
}

def _norm(s: str) -> str:
    return (s or "").strip().lower()

def get_skill_gaps_and_courses(current_skills: List[str], target_role: str) -> Tuple[List[str], List[Dict]]:
    target = ROLE_SKILLS.get(target_role, [])
    cur = {_norm(x) for x in (current_skills or []) if _norm(x)}
    gaps = [s for s in target if _norm(s) not in cur]

    gap_set = {_norm(g) for g in gaps}
    recommended = []
    seen = set()

    for c in COURSES:
        c_skills = [_norm(x) for x in (c.get("skills") or []) if _norm(x)]
        hit = next((s for s in c_skills if s in gap_set), None)
        if not hit:
            continue
        # de-dup by url
        url = c.get("url") or ""
        if url in seen:
            continue
        seen.add(url)
        recommended.append({
            "title": c.get("title", ""),
            "platform": c.get("platform", ""),
            "url": url,
            "skill": hit,
        })

    # Sort: show courses for the first few gaps earlier
    gap_rank = {g: i for i, g in enumerate(gap_set)}
    recommended.sort(key=lambda x: gap_rank.get(_norm(x.get("skill","")), 999))

    return gaps, recommended[:30]
