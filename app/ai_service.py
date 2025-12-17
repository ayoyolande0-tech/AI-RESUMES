from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def enhance_experience(description: str) -> str:
    if not description or len(description.strip()) < 3:
        return "Contribué à des projets techniques"

    prompt = f'''
Tu es un recruteur senior chez HireAfrica.
Tu réécris des expériences pour des CV africains ATS-friendly.

RÈGLES ABSOLUES QUE TU DOIT OBLIGATOIREMENT RESPECTER :
- Commencer par un verbe d'action fort au passé comme j'ai
- Phrase complète, puissante, en français parfait
- Maximum 300 caractères
- Ne jamais inventer : outil, chiffre, pays, entreprise, technologie
- Si l'utilisateur dit "j'ai codé des sites" → tu dis uniquement "J'ai Développé des sites web avec divers languages de programmation"
- Si l'utilisateur dit "j'ai vendu" → "J'ai Vendu des produits en point de vente et mon entreprise a pu emprofiter"
- Tu n'ajoutes rien qui n'est pas dans le texte original

Texte original : "{description}"

Réponse (UNE SEULE ligne, sans tiret, sans guillemets) :
'''

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=120,
            top_p=0.8
        )
        content = response.choices[0].message.content.strip()
        final = content.splitlines()[0].strip()
        # cleanup
        for bad in ["- ", "• ", '"', "'", "→", "* ", "1.", "2."]:
            if final.startswith(bad):
                final = final[len(bad):].strip()
        return final[:300]
    except Exception as e:
        # fallback: return original trimmed
        return description.strip()[:300]
    
    
def generate_cover_letter(job_title: str, company: str, user_data: dict) -> str:
    prompt = f'''
Tu es un expert en recrutement africain.

Rédige une lettre de motivation professionnelle en français (max 300 mots) pour :
- Poste : {job_title}
- Entreprise : {company}
- Candidat : {user_data.get("full_name", "Candidat")}
- Expérience : {", ".join([e["description"] for e in user_data.get("experiences", [])[:2]])}
- Compétences : {", ".join(user_data.get("skills", [])[:5])}

Ton : professionnel, confiant, orienté résultats.
Commence par "Madame, Monsieur," et termine par "Veuillez agréer..."
Pas de phrases vides. Que du concret.
'''

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except:
        return "Erreur lors de la génération de la lettre de motivation."
    
    

def ats_scan(cv_text: str, job_description:str)-> dict:
    
    #on nettoie les textes
    def clean_text(text:str) ->str:
        text= re.sub(r'\s+', ' ', text.lower())
        return ' '.join(text.split())
    
    cv_clean= clean_text(cv_text)
    job_clean= clean_text(job_description)
    
    
    # extraction des mots cles 
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([job_clean])
    keywords= sorted(vectorizer.get_feature_names_out(), key= lambda x: tfidf_matrix[0, vectorizer.vocabulary_[x]], reverse=True)[:20]
    
    
    # on donne le score
    tfidf_cv= vectorizer.transform([cv_clean])
    score= cosine_similarity(tfidf_cv, tfidf_matrix)[0][0] * 100

    # on cherches les motsmanquant dans le cv
    missing_keywords = [kw for kw in keywords if kw not in cv_clean.split()]

    # Suggestions
    suggestions = [f"Ajoutez '{kw}' dans votre CV pour booster le score." for kw in missing_keywords[:5]] if missing_keywords else ["Votre CV est bien optimisé !"]

    return {
        "score": round(score, 2),
        "missing_keywords": missing_keywords,
        "suggestions": suggestions,
        "message": "Scan ATS terminé."
    }