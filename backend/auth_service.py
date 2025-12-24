from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from typing import Optional
from models import TokenData
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict, expires_delta: timedelta) -> str:
    """Create a JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_access_token(user_id: str) -> str:
    """Create an access token"""
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_token({"sub": user_id, "type": "access"}, expires_delta)

def create_refresh_token(user_id: str) -> str:
    """Create a refresh token"""
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_token({"sub": user_id, "type": "refresh"}, expires_delta)

def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return TokenData(user_id=user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to get current user from JWT token"""
    token = credentials.credentials
    token_data = decode_token(token)
    return token_data.user_id