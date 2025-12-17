# app/core/security.py
from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Chargement des clefs
PRIVATE_KEY = None
PUBLIC_KEY = None
if os.path.exists("jwt-private.pem") and os.path.exists("jwt-public.pem"):
    with open("jwt-private.pem", "rb") as f:
        PRIVATE_KEY = f.read()
    with open("jwt-public.pem", "rb") as f:
        PUBLIC_KEY = f.read()
else:
    PRIVATE_KEY = os.getenv("JWT_PRIVATE_KEY")
    PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")

if not PRIVATE_KEY or not PUBLIC_KEY:
    raise RuntimeError("Clés JWT manquantes ! Met jwt-private.pem / jwt-public.pem ou variables d'env")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, PRIVATE_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
