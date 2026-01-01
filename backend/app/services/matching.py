import os
import re
from typing import List, Tuple

USE_SENTENCE_TRANSFORMER = os.getenv("USE_SENTENCE_TRANSFORMER", "0") == "1"

_model = None

def _get_model():
    """
    Lazy-load SentenceTransformer only if enabled.
    Prevents Cloud Run cold-start failures and HF 429s.
    """
    global _model
    if not USE_SENTENCE_TRANSFORMER:
        return None
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model


SKILL_REGEX = re.compile(r"\b(python|java|javascript|typescript|react|next\.js|node\.js|sql|postgres|docker|kubernetes|aws|gcp|azure|ml|nlp)\b", re.I)

def extract_required_skills_from_jd(jd_text: str) -> List[str]:
    if not jd_text:
        return []
    found = set(m.group(0).lower() for m in SKILL_REGEX.finditer(jd_text))
    return sorted(found)

def compute_match_score(resume_skills: List[str], jd_skills: List[str]) -> float:
    if not jd_skills:
        return 0.0
    rs = set(s.lower() for s in (resume_skills or []))
    js = set(s.lower() for s in (jd_skills or []))
    overlap = len(rs.intersection(js))
    return round((overlap / max(len(js), 1)) * 100.0, 2)