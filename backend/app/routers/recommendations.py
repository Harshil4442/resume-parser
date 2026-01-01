from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..security import get_current_user
from ..services.recommender import get_skill_gaps_and_courses

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/gaps")
async def skill_gaps(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target_role = (payload.get("target_role") or "").strip()
    if not target_role:
        raise HTTPException(status_code=400, detail="target_role is required")

    current_skills = payload.get("current_skills")
    if not current_skills:
        latest_resume = (
            db.query(models.Resume)
            .filter(models.Resume.user_id == current_user.id)
            .order_by(models.Resume.created_at.desc())
            .first()
        )
        current_skills = (latest_resume.skills if latest_resume and latest_resume.skills else [])

    gaps, courses = get_skill_gaps_and_courses(current_skills, target_role)
    return {"skill_gaps": gaps, "recommended_courses": courses, "current_skills": current_skills}
