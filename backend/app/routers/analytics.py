from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models, schemas
from ..security import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = current_user.id

    resume_count = db.query(models.Resume).filter(models.Resume.user_id == user_id).count()
    jd_count = db.query(models.JobDescription).filter(models.JobDescription.user_id == user_id).count()

    # average match score
    avg_score = db.query(func.avg(models.MatchResult.score)).filter(models.MatchResult.user_id == user_id).scalar()
    avg_score = float(avg_score or 0.0)

    # profile completeness (simple)
    profile_completeness = 0.0
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == user_id)
        .order_by(models.Resume.created_at.desc())
        .first()
    )
    if latest_resume:
        profile_completeness = min(100.0, float(len(latest_resume.skills or [])) * 5.0)

    # match history (last 20)
    rows = (
        db.query(models.MatchResult.created_at, models.MatchResult.score)
        .filter(models.MatchResult.user_id == user_id)
        .order_by(models.MatchResult.created_at.desc())
        .limit(20)
        .all()
    )
    history = [{"created_at": r[0], "score": float(r[1])} for r in rows]

    return schemas.AnalyticsSummary(
        profile_completeness=round(profile_completeness, 2),
        average_match_score=round(avg_score, 2),
        resume_count=resume_count,
        jd_count=jd_count,
        applications_count=jd_count,
        match_history=history[::-1],  # oldest->newest for charts
    )