import io
import re
from typing import List, Dict, Tuple

import pdfplumber
import spacy
from functools import lru_cache

@lru_cache(maxsize=1)
def get_nlp():
    try:
        return spacy.load("en_core_web_sm")
    except Exception:
        return spacy.blank("en")

# Demo vocabulary. Extend by loading a skills list from a file or DB.
SKILL_VOCAB = {
    "python", "pytorch", "tensorflow", "fastapi", "django", "react",
    "node.js", "docker", "kubernetes", "nlp", "machine learning",
    "data analysis", "sql", "postgresql", "aws", "gcp", "azure",
    "linux", "git", "ci/cd", "rest", "api", "javascript", "typescript",
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text

def heuristic_sections(text: str) -> Dict[str, str]:
    sections: Dict[str, List[str]] = {}
    current = "other"
    sections[current] = []

    for line in text.splitlines():
        header = line.strip().lower()
        if re.match(r"^(experience|work experience)$", header):
            current = "experience"
            sections[current] = []
        elif re.match(r"^(education)$", header):
            current = "education"
            sections[current] = []
        elif re.match(r"^(skills|technical skills)$", header):
            current = "skills"
            sections[current] = []
        else:
            sections.setdefault(current, []).append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}

def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = {s for s in SKILL_VOCAB if s in text_lower}
    return sorted(found)

def estimate_experience_years(text: str) -> float:
    matches = re.findall(r"(\d+)\+?\s+years", text.lower())
    nums = [int(m) for m in matches]
    if not nums:
        return 1.0
    return float(max(nums))

def parse_resume_file(file_bytes: bytes) -> Tuple[str, Dict[str, str], List[str], float]:
    raw_text = extract_text_from_pdf(file_bytes)
    sections = heuristic_sections(raw_text)
    skills = extract_skills(raw_text)
    exp_years = estimate_experience_years(raw_text)
    return raw_text, sections, skills, exp_years