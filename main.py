from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.routers.ai_generation import router as ai_generation_router
from app.routers.resume import router as resume_router
from app.routers.auth import router as auth_router
from app.routers.payment import router as payment_router
from app.database import create_db_and_tables
from app.core.limiter import limiter

app = FastAPI(
    title="HireAfrica API",
    description="Le meilleur CV builder d'Afrique",
    version="1.0",
    docs_url="/docs",        # ← ACTIVÉ
    redoc_url="/redoc"       # ← ACTIVÉ
)

# Rate limiter
app.state.limiter = limiter

# CORS
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router)
app.include_router(ai_generation_router)
app.include_router(resume_router)
app.include_router(payment_router)

# Créer la base de données
@app.on_event("startup")
def startup():
    create_db_and_tables()

@app.get("/")
def home():
    return {"message": "HireAfrica API marche à fond !"}

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Trop de tentatives. Réessaie dans 1 minute."}
    )