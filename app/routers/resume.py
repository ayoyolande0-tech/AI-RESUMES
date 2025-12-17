from fastapi import APIRouter
from fastapi.params import Body
from app.models.models import ResumeInput, Resume, User
from app.ai_service import ats_scan, enhance_experience
from app.database import create_db_and_tables, get_session
from sqlmodel import Session, select
import uuid
from fastapi.responses import StreamingResponse
from io import BytesIO
from app.pdf_generator import generate_pdf_with_watermark  
from fastapi import  Depends, HTTPException
from sqlmodel import select
from typing import List
from app.routers.auth import get_current_user
import json
from app.models.models import ResumePreviewResponse, ExperiencePreview
from datetime import datetime

router= APIRouter(
    prefix= "/resume", tags=["resumes"]
)


@router.get("/api/my-resumes", response_model=List[ResumePreviewResponse])
async def get_my_resumes(
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resumes = session.exec(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    ).all()

    result = []
    for r in resumes:
        try:
            data = json.loads(r.data) 
        except:
            data = {}

        experiences = data.get("experiences", [])
        latest_exp = experiences[0] if experiences else None

        result.append(ResumePreviewResponse(
            id=r.id,
            title=r.title,
            template=r.template,
            created_at=r.created_at,
            updated_at=r.updated_at,
            full_name=data.get("full_name", "CV sans nom"),
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            job_title=latest_exp.get("job_title") if latest_exp else None,
            company=latest_exp.get("company") if latest_exp else None,
            latest_experience=ExperiencePreview(**latest_exp) if latest_exp else None,
            total_experiences=len(experiences),
            skills_count=len(data.get("skills", [])),
            has_cover_letter=False,
            is_pro=False  # ← À connecter au paiement plus tard
        ))

    return result

@router.post("/api/enhance-resume")
def enhance_resume(data: ResumeInput):
    enhanced_experiences = []
    for exp in data.experiences:
        better = enhance_experience(exp.description)
        enhanced_experiences.append({
            "job_title": exp.job_title,
            "company": exp.company,
            "start_date": exp.start_date,
            "end_date": exp.end_date or "Présent",
            "description": better
        })

    return {
        "success": True,
        "full_name": data.full_name,
        "enhanced_experiences": enhanced_experiences,
        "skills": data.skills,
        "template": data.template,
        "message": "CV amélioré avec l'IA Groq"
    }


@router.on_event("startup")
def on_startup():
    create_db_and_tables()


@router.post("/api/save-resume")
async def save_resume(resume_data: dict, session: Session = Depends(get_session)):
    email = resume_data.get("email", "").strip()
    full_name = resume_data.get("full_name", "Utilisateur")

    if not email:
        email = f"guest_{uuid.uuid4().hex[:8]}@hireafrica.com"

    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        user = User(email=email, full_name=full_name, linkedInProfile=None)
        session.add(user)
        session.commit()
        session.refresh(user)

    resume = Resume(
        user_id=user.id,
        title=f"{full_name} - {resume_data.get('template', 'modern')}",
        template=resume_data.get("template", "modern"),
        data=str(resume_data)  
    )
    session.add(resume)
    session.commit()
    session.refresh(resume)

    return {"success": True, "resume_id": resume.id, "message": "CV sauvegardé"}



@router.post("/api/generate-pdf")
def generate_pdf(resume_data: dict):
    try:
        #  On récupère les expériences 
        experiences = resume_data.get("experiences", [])
        enhanced_experiences = []

        #  On passe chaque description dans l'IA Groq
        for exp in experiences:
            better_desc = enhance_experience(exp.get("description", ""))
            enhanced_experiences.append({
                **exp,
                "description": better_desc
            })

        #  On injecte les expériences améliorées dans les données
        resume_data["enhanced_experiences"] = enhanced_experiences
        

        # Génération du PDF avec les textes IA
        pdf_bytes = generate_pdf_with_watermark(resume_data)

        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={resume_data.get('full_name', 'CV')}_HireAfrica.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur PDF: {str(e)}")

# === SUPPRESSION CV ===
@router.delete("/api/resume/{resume_id}")
def delete_resume(resume_id: int, session: Session = Depends(get_session)):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "CV non trouvé")
    session.delete(resume)
    session.commit()
    return {"success": True, "message": "CV supprimé avec succès"}


# RÉCUPÉRER UN CV POUR ÉDITION
@router.get("/api/resume/{resume_id}")
async def get_resume_for_edit(
    resume_id: int,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "CV non trouvé")
    if resume.user_id != current_user.id:
        raise HTTPException(403, "Accès refusé")

    try:
        data = json.loads(resume.data)
    except:
        data = {}

    return {
        "id": resume.id,
        "title": resume.title,
        "template": resume.template,
        "data": data,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }


# METTRE À JOUR UN CV EXISTANT
@router.put("/api/resume/{resume_id}")
async def update_resume(
    resume_id: int,
    resume_data: dict,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "CV non trouvé")
    if resume.user_id != current_user.id:
        raise HTTPException(403, "Accès refusé")

    # Mise à jour des données
    resume.data = json.dumps(resume_data, ensure_ascii=False)
    resume.template = resume_data.get("template", resume.template)
    resume.title = f"{resume_data.get('full_name', 'CV')} - {resume.template}"
    resume.updated_at = datetime.utcnow()

    session.add(resume)
    session.commit()
    session.refresh(resume)

    return {
        "success": True,
        "message": "CV mis à jour avec succès",
        "resume_id": resume.id
    }

# GÉNÉRER PDF À PARTIR D'UN CV SAUVEGARDÉ
@router.get("/api/resume/{resume_id}/pdf")
async def generate_pdf_from_saved_resume(
    resume_id: int,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "CV non trouvé")
    if resume.user_id != current_user.id:
        raise HTTPException(403, "Accès refusé")

    try:
        data = json.loads(resume.data)
    except:
        raise HTTPException(500, "Données du CV corrompues")

    # Optionnel : ré-améliorer les expériences au moment du téléchargement
    # (si tu veux que chaque PDF soit toujours au top avec l'IA)
    experiences = data.get("experiences", [])
    enhanced_experiences = []
    for exp in experiences:
        better_desc = enhance_experience(exp.get("description", ""))
        enhanced_experiences.append({**exp, "description": better_desc})
    
    data["enhanced_experiences"] = enhanced_experiences

    # Génère le PDF
    pdf_bytes = generate_pdf_with_watermark(data)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.get("full_name", "CV")}_HireAfrica_{data.get("template", "modern")}.pdf"'
        }
    )