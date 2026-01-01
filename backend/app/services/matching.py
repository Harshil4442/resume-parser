# backend/app/services/matching.py
import os
import re
import logging
from functools import lru_cache
from typing import List, Optional

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def _simple_tokenize(s: str) -> set[str]:
    return set(re.findall(r"[a-z0-9\+\#\.\-]{2,}", (s or "").lower()))


def _jaccard(a: str, b: str) -> float:
    A, B = _simple_tokenize(a), _simple_tokenize(b)
    if not A or not B:
        return 0.0
    return len(A & B) / len(A | B)


@lru_cache(maxsize=1)
def _get_sentence_transformer():
    """
    Lazy-load the SentenceTransformer ONLY when needed, and only if enabled.

    Default is disabled on Cloud Run to avoid:
      - cold-start downloads
      - HF rate limits (429)
      - startup crashes (container never binds PORT)
    """
    if os.getenv("USE_SENTENCE_TRANSFORMER", "0") != "1":
        return None

    # Cache location must be writable on Cloud Run (use /tmp)
    os.environ.setdefault("HF_HOME", "/tmp/hf")
    os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/hf/transformers")

    # HF docs: can disable hf-xet usage via env var if it causes issues
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")  # optional but recommended  [oai_citation:1‡Hugging Face](https://huggingface.co/docs/huggingface_hub/en/package_reference/environment_variables?utm_source=chatgpt.com)

    model_name = os.getenv("ST_MODEL", DEFAULT_MODEL)

    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(model_name)


def _cosine_sim(v1, v2) -> float:
    # vectors are already normalized when normalize_embeddings=True
    return float(sum(a * b for a, b in zip(v1, v2)))


def compute_match_score(resume_text: str, jd_text: str) -> float:
    """
    Returns match score in [0..1-ish].
    If transformer isn't enabled/available, fallback to a stable keyword overlap score.
    """
    st = None
    try:
        st = _get_sentence_transformer()
        if st is not None:
            emb = st.encode([resume_text, jd_text], normalize_embeddings=True)
            return _cosine_sim(emb[0], emb[1])
    except Exception as e:
        # If HF rate-limits / model download fails, do NOT crash the app.
        logger.exception("SentenceTransformer failed; using fallback. Error: %s", e)

    return _jaccard(resume_text, jd_text)


def extract_required_skills_from_jd(jd_text: str) -> List[str]:
    # keep your existing implementation if you already have one;
    # minimal safe version:
    tokens = sorted(_simple_tokenize(jd_text))
    # just return top-ish tokens as "skills" baseline (replace with your extractor if present)
    return tokens[:30]
