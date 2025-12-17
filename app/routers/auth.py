# app/routers/auth.py (extraits)
from fastapi import APIRouter, Depends, HTTPException, status, Form, Header
from sqlmodel import Session, select
from app.models.models import User, RegisterInput
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.database import get_session

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_current_user(
    authorization: str = Header(None),
    session: Session = Depends(get_session)
):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requis")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
        payload = decode_token(token)
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide ou expiré")
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur non trouvé")
    return user


@router.post("/register")
def register(user: RegisterInput, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    new_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        linkedInProfile=user.linkedInProfile
    )
    session.add(new_user)
    session.commit()
    return {"message": "Inscription réussie. Connectez-vous."}

@router.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "expires_in": 1800}

@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "full_name": current_user.full_name}
