# app/routers/ai_generation.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Body
from app.models.models import ResumeInput, User
from app.ai_service import enhance_experience, generate_cover_letter  # <-- AJOUTÉ generate_cover_letter
from app.routers.auth import get_current_user
from app.pdf_generator import generate_cover_letter_pdf
from fastapi.responses import StreamingResponse
from io import BytesIO
from app.ai_service import ats_scan

router = APIRouter(prefix="/ai-generation", tags=["ai-generation"])

# Amélioration du CV (déjà bon)
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
        "email": data.email,
        "phone": data.phone,
        "enhanced_experiences": enhanced_experiences,
        "education": data.education,
        "projects": data.projects,
        "certifications": data.certifications,
        "activities": data.activities,
        "languages": data.languages,
        "skills": data.skills,
        "template": data.template,
        "message": "CV amélioré avec l'IA Groq"
    }


@router.post("/api/generate-cover-letter-pdf")
def generate_cover_letter_pdf_endpoint(
    payload: dict,
    current_user: User | None = Depends(get_current_user, use_cache=False)
):
    job_title = payload.get("job_title", "Poste à pourvoir")
    company = payload.get("company", "Entreprise")
    full_name = payload.get("full_name") or (current_user.full_name if current_user else "Candidat")
    email = payload.get("email", "")
    phone = payload.get("phone", "")

    # Génère la lettre texte
    cover_letter_text = generate_cover_letter(job_title, company, payload)

    # Prépare les données pour le PDF
    pdf_data = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "job_title": job_title,
        "company": company,
        "cover_letter": cover_letter_text
    }

    pdf_bytes = generate_cover_letter_pdf(pdf_data)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Lettre_Motivation_{full_name.replace(' ', '_')}_{company}.pdf"
        }
    )
    
@router.post("/api/generate-cover-letter-text")
def generate_cover_letter_text_endpoint(
    payload: dict,
    current_user: User | None = Depends(get_current_user, use_cache=False)
):
    job_title = payload.get("job_title", "Poste à pourvoir")
    company = payload.get("company", "Entreprise")

    # Génère seulement le texte
    cover_letter_text = generate_cover_letter(job_title, company, payload)

    return {"text": cover_letter_text}
    
    
# @router.post("/api/ats-scan")
# def ats_scan_endpoint(
#     cv_text : str,
#     job_description :str,
#     current_user : User | None = Depends(get_current_user)
# ):   

#     result = ats_scan(cv_text, job_description)

#     return result


    
@router.post("/api/ats-scan")
async def ats_scan_endpoint(
    data: dict = Body(...),
    current_user = Depends(get_current_user)
):
    cv_text = data.get("cv_text", "")
    job_description = data.get("job_description", "")
    
    if not cv_text or not job_description:
        raise HTTPException(status_code=400, detail="cv_text et job_description requis")
    
    result = ats_scan(cv_text, job_description)
    return result