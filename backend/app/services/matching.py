import re
from typing import Any, Iterable, Tuple, List, Set

from sentence_transformers import SentenceTransformer, util

# IMPORTANT:
# - This module is used in /jobs/match.
# - Your error "'list' object has no attribute 'lower'" happens when job_description
#   comes as a list/JSON rather than a plain string.
# - Fix: normalize input to string safely.

# If you disabled sentence-transformers via env (USE_SENTENCE_TRANSFORMER=0),
# this file may still be imported; keep it lightweight.
USE_ST = True
try:
    import os
    USE_ST = os.getenv("USE_SENTENCE_TRANSFORMER", "1") not in ("0", "false", "False")
except Exception:
    USE_ST = True

_model = None
def _get_model():
    global _model
    if _model is None and USE_ST:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model


def _to_text(x: Any) -> str:
    """Convert arbitrary payload to a best-effort string."""
    if x is None:
        return ""
    if isinstance(x, str):
        return x
    if isinstance(x, (list, tuple, set)):
        # join only string-ish items
        parts = []
        for i in x:
            if i is None:
                continue
            parts.append(str(i))
        return "\n".join(parts)
    if isinstance(x, dict):
        # join values
        parts = []
        for k, v in x.items():
            parts.append(f"{k}: {v}")
        return "\n".join(parts)
    return str(x)


def _normalize_skill(s: Any) -> str:
    if s is None:
        return ""
    s = str(s)
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s


def extract_required_skills_from_jd(job_description: Any) -> List[str]:
    """
    Very simple extractor:
    - tokenizes job description text
    - matches against a small curated set + heuristics
    """
    text = _to_text(job_description).lower()

    # Common skills list (starter set). You can expand this list anytime.
    known = {
        "python", "java", "javascript", "typescript", "react", "next.js", "node", "node.js",
        "fastapi", "django", "flask",
        "sql", "postgresql", "mysql", "mongodb",
        "docker", "kubernetes", "aws", "gcp", "azure",
        "git", "linux",
        "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow",
        "ci/cd", "graphql", "rest", "redis"
    }

    found: Set[str] = set()
    for k in known:
        # handle dot skills like next.js
        if k in text:
            found.add(k)

    # crude regex for things like "C++", "C#", "golang"
    if re.search(r"\bc\+\+\b", text):
        found.add("c++")
    if re.search(r"\bc#\b", text):
        found.add("c#")
    if re.search(r"\bgolang\b|\bgo\b", text):
        found.add("go")

    # normalize
    return sorted({_normalize_skill(s) for s in found if s})


def compute_match_score(
    resume_skills: Iterable[Any],
    required_skills: Iterable[Any],
) -> Tuple[float, List[str]]:
    """
    Returns:
      score: 0..100
      missing: list of required skills not found
    """
    rs = {_normalize_skill(s) for s in (resume_skills or []) if _normalize_skill(s)}
    rq = {_normalize_skill(s) for s in (required_skills or []) if _normalize_skill(s)}

    if not rq:
        return 0.0, []

    missing = sorted(list(rq - rs))

    # baseline overlap score
    overlap = len(rq & rs)
    score = (overlap / max(len(rq), 1)) * 100.0

    # optional semantic boost (only if enabled and model available)
    model = _get_model()
    if model and missing:
        try:
            rs_list = sorted(list(rs))
            if rs_list:
                emb_resume = model.encode(rs_list, convert_to_tensor=True)
                emb_missing = model.encode(missing, convert_to_tensor=True)
                sims = util.cos_sim(emb_missing, emb_resume)  # [missing x resume]
                # If a "missing" skill is semantically close to something in resume, reduce penalty a bit.
                close = (sims.max(dim=1).values > 0.55).sum().item()
                # recover up to 15 points
                score = min(100.0, score + min(15.0, float(close) * 3.0))
        except Exception:
            # keep baseline score if anything fails
            pass

    return float(score), missing