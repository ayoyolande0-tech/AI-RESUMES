
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from typing import List


class ExperienceInput(BaseModel):
    job_title: str
    company: str
    start_date: str
    end_date: Optional[str] = None
    description: str


class EducationInput(BaseModel):
    etablissement: str
    diplome: str
    start_date: str
    end_date: Optional[str] = None
    

class ProjectInput(BaseModel):
    description: str
    annee: str
    

class CertificationInput(BaseModel):
    name: str
    issuer: Optional[str]= None
    year: Optional[str]= None
    
class ActivityInput(BaseModel):
    name: str
    description: Optional[str]= None
    
class LanguageInput(BaseModel):
    name: str
    level: str
    
class UserCreate(SQLModel):
    email:str
    password:str
    full_name: Optional[str]= None
    
class UserLogin(SQLModel):
    email:str
    password:str
    
class Token(SQLModel):
    access_token: str
    token_type:str= "bearer"
    
class RegisterInput(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    linkedInProfile: Optional[str] = None
    
class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(index=True, unique=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ExperiencePreview(BaseModel):
    job_title: str
    company: str
    start_date: str
    end_date: Optional[str] = None

class ResumePreviewResponse(BaseModel):
    id: int
    title: str
    template: str
    created_at: datetime
    updated_at: datetime
    
    full_name: str
    email: str
    phone: str
    job_title: Optional[str] = None
    company: Optional[str] = None
    
    latest_experience: Optional[ExperiencePreview] = None
    total_experiences: int = 0
    skills_count: int = 0
    has_cover_letter: bool = False
    is_pro: bool = False
      
class ResumeInput(BaseModel):
    title: str = "Mon CV"
    template: str = "modern"
    full_name: str
    email: str
    phone: str
    experiences: List[ExperienceInput] = []
    education: List[EducationInput] = []
    projects: List[ProjectInput] = []
    certifications: List[CertificationInput] = []
    activities: List[ActivityInput] = []
    languages: List[LanguageInput] = []
    skills: List[str] = []
    
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str]= None
    hashed_password: str = Field(..., nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    linkedInProfile: Optional[str] = Field(default=None, unique=True)
    resumes: List["Resume"] = Relationship(back_populates="owner")

class Resume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    title: str = "Mon CV"
    template: str = "modern"
    data: str  
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional[User] = Relationship(back_populates="resumes")
    
    

    
    