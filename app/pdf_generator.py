from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from datetime import datetime

env = Environment(loader= FileSystemLoader("app/templates"))


def generate_pdf_with_watermark(resume_data: dict) -> bytes:
    template_name = resume_data.get("template", "modern")
    template= env.get_template(f"{template_name}.html")
    
    
    context = {
    "full_name": resume_data.get("full_name", "Candidat"),
    "email": resume_data.get("email", ""),
    "phone": resume_data.get("phone", ""),
    "experiences": resume_data.get("enhanced_experiences", resume_data.get("experiences", [])),
    "education": resume_data.get("education", []),
    "skills": resume_data.get("skills", []),
    "projects": resume_data.get("projects", []),
    "certifications": resume_data.get("certifications", []),
    "activities": resume_data.get("activities", []),
    "languages": resume_data.get("languages", []),
}
    
    html_content = template.render(context)
    
    pdf_file = HTML(string=html_content).write_pdf()
    
    return pdf_file

def generate_cover_letter_pdf(data: dict) -> bytes:
    template = env.get_template("cover_letter.html")
    
    context = {
        "full_name": data.get("full_name", "Candidat"),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "job_title": data.get("job_title", "Poste à pourvoir"),
        "company": data.get("company", "Entreprise"),
        "cover_letter": data.get("cover_letter", "").replace("\n", "\n"),
        "date": datetime.now().strftime("%d %B %Y")
    }
    
    html_content = template.render(context)
    pdf_file = HTML(string=html_content).write_pdf()
    
    return pdf_file