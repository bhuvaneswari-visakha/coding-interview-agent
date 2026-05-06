import os
from pathlib import Path
from typing import AsyncGenerator
import asyncio
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from models import Base, User
from schema import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse

ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Add it to your .env file.")

# Optimized database connection pool
engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    pool_size=20,           # Increased from default 5
    max_overflow=10,        # Allow 10 extra connections under load
    pool_pre_ping=True,     # Verify connections before use
    pool_recycle=3600       # Recycle connections every hour
)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Use faster bcrypt rounds for better performance (still secure)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)

# Thread pool for CPU-intensive password hashing
_hash_executor = ThreadPoolExecutor(max_workers=4)

router = APIRouter(tags=["authentication"])


async def get_db() -> AsyncGenerator[AsyncSession, None]:   #Provides database session to endpoints.
    async with AsyncSessionLocal() as session: 
        yield session


async def initialize_database() -> None:        #Creates all database tables if they don’t exist.
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)   #Create a new user account.
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing_user = await db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Hash password asynchronously to avoid blocking
    password_hash = await _hash_password_async(payload.password)

    new_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=password_hash,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "username": new_user.username,
            "email": new_user.email,
        },
    }

@router.post("/login", response_model=LoginResponse)        #Authenticate existing user.
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password asynchronously to avoid blocking
    is_valid = await _verify_password_async(payload.password, user.password_hash)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return {
        "message": "Login successful",
        "user": {
            "username": user.username,
            "email": user.email,
        },
    }


async def _hash_password_async(password: str) -> str:
    """Hash password in thread pool to avoid blocking event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_hash_executor, pwd_context.hash, password)


async def _verify_password_async(plain_password: str, hashed_password: str) -> bool:
    """Verify password in thread pool to avoid blocking event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_hash_executor, pwd_context.verify, plain_password, hashed_password)
