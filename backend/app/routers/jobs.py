from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..services.matching import extract_required_skills_from_jd, compute_match_score
from ..security import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/match", response_model=dict)
def match_job(
    payload: schemas.JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(models.Resume.id == payload.resume_id, models.Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found for this user")

    required_skills = extract_required_skills_from_jd(payload.job_description)
    score, missing = compute_match_score(resume.skills or [], required_skills)
    
    jd = payload.job_description
    if isinstance(jd, list):
        jd_text = "\n".join([str(x) for x in jd])
    else:
        jd_text = str(jd)

    match = models.JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=payload.job_title,
        company=payload.company or "",
        job_description=jd_text,
        match_score=score,
        extracted_skills=required_skills,
        missing_skills=missing,
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    return {
        "match_id": match.id,
        "match_score": match.match_score,
        "required_skills": required_skills,
        "missing_skills": missing,
    }
