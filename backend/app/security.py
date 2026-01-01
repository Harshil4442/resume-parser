import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

# -------------------------------
# Password hashing
# -------------------------------
pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],  # accept old bcrypt hashes too
    deprecated="auto"
)

def _validate_bcrypt_password_length(password: str) -> None:
    # bcrypt only uses first 72 bytes (not characters)
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long. Maximum is 72 bytes (about 72 ASCII characters).",
        )

def hash_password(password: str) -> str:
    _validate_bcrypt_password_length(password)
    # Guard: catch accidental non-string values
    if not isinstance(password, str):
        raise HTTPException(status_code=400, detail=f"Password must be a string, got {type(password)}")

    # Debug (temporary): confirms what you're hashing
    print("DEBUG password repr:", repr(password))
    print("DEBUG password bytes:", len(password.encode("utf-8")))

    # bcrypt limit (72 bytes)
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long. Maximum is 72 bytes (bcrypt limit).",
        )

    return pwd_context.hash(password)

def verify_password(plain_password: str, password_hash: str) -> bool:
    if len(plain_password.encode("utf-8")) > 72:
        return False
    return pwd_context.verify(plain_password, password_hash)

# -------------------------------
# JWT config
# -------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days default

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(*, subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user
