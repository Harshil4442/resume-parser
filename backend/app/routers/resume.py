from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..services.parsing import parse_resume_file
from ..security import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/parse", response_model=schemas.ResumeParseResponse)
async def parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF supported in this starter template.")

    file_bytes = await file.read()
    raw_text, sections, skills, exp_years = parse_resume_file(file_bytes)

    resume = models.Resume(
        user_id=current_user.id,
        original_filename=file.filename or "",
        raw_text=raw_text,
        skills=skills,
        experience_years=exp_years,
        sections=sections,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return schemas.ResumeParseResponse(
        resume_id=resume.id,
        skills=skills,
        experience_years=exp_years,
        sections=sections,
    )
