import logging
import os
import socket
from pathlib import Path
from typing import AsyncGenerator
from urllib.parse import urlparse, urlunparse
import asyncio
from concurrent.futures import ThreadPoolExecutor

import asyncpg
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from models import Base, User
from schema import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(ENV_PATH)


def _mask_database_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.username:
        username = parsed.username
        password = "*****" if parsed.password else None
        netloc = username
        if password:
            netloc += f":{password}"
        if parsed.hostname:
            netloc += f"@{parsed.hostname}"
        if parsed.port:
            netloc += f":{parsed.port}"
    else:
        netloc = parsed.hostname or ""
        if parsed.port:
            netloc += f":{parsed.port}"

    masked = parsed._replace(netloc=netloc)
    return masked.geturl()


def _normalize_database_url(raw_url: str) -> str:
    parsed = urlparse(raw_url)
    scheme = parsed.scheme

    if scheme in {"postgres", "postgresql"}:
        scheme = "postgresql+asyncpg"
    elif scheme == "postgresql+asyncpg":
        scheme = "postgresql+asyncpg"
    else:
        raise RuntimeError(
            "Unsupported DATABASE_URL scheme. Use 'postgresql+asyncpg://', or legacy 'postgres://' for auto-conversion."
        )

    normalized = parsed._replace(scheme=scheme)
    return urlunparse(normalized)


def _validate_hostname(hostname: str, port: int | None) -> None:
    try:
        socket.getaddrinfo(hostname, port or 5432)
    except socket.gaierror as exc:
        logger.error("DNS resolution failed for DATABASE_URL hostname %s:%s: %s", hostname, port or 5432, exc)
        raise RuntimeError(
            "DATABASE_URL hostname resolution failed. Verify the host name in your Render DATABASE_URL setting."
        ) from exc
    except OSError as exc:
        logger.error("Hostname validation failed for DATABASE_URL host %s:%s: %s", hostname, port or 5432, exc)
        raise RuntimeError(
            "DATABASE_URL hostname validation failed. Check network connectivity and hostname format."
        ) from exc


def get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL")
    if raw_url is None or not raw_url.strip():
        logger.error("DATABASE_URL environment variable is missing or empty.")
        raise RuntimeError(
            "DATABASE_URL is missing. Configure DATABASE_URL in Render environment settings or in .env for local development."
        )

    raw_url = raw_url.strip()
    normalized_url = _normalize_database_url(raw_url)
    parsed = urlparse(normalized_url)

    if not parsed.hostname:
        logger.error("DATABASE_URL hostname is invalid: %s", _mask_database_url(normalized_url))
        raise RuntimeError(
            "DATABASE_URL is invalid: hostname is missing or malformed."
        )

    _validate_hostname(parsed.hostname, parsed.port)

    logger.info("DATABASE_URL found: %s", _mask_database_url(normalized_url))
    logger.info(
        "Database connection details: host=%s port=%s database=%s driver=%s",
        parsed.hostname,
        parsed.port or "default",
        parsed.path.lstrip("/") or "<none>",
        parsed.scheme,
    )

    return normalized_url


DATABASE_URL = get_database_url()

# Optimized database connection pool for asyncpg
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
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


async def _interpret_db_exception(exc: Exception) -> str:
    origin = exc.orig if isinstance(exc, DBAPIError) else exc

    if isinstance(origin, socket.gaierror):
        return (
            "DNS resolution failed while connecting to the database host. "
            "Verify DATABASE_URL hostname and Render database settings."
        )
    if isinstance(origin, asyncpg.InvalidPasswordError):
        return "Authentication failed: invalid database password. Check DATABASE_URL credentials."
    if isinstance(origin, asyncpg.InvalidCatalogNameError):
        return "Database does not exist. Verify the database name in DATABASE_URL."
    if isinstance(origin, asyncpg.InvalidAuthorizationSpecificationError):
        return "Authentication failed: invalid authorization specification. Check DATABASE_URL credentials."
    if isinstance(origin, asyncpg.PostgresError):
        return f"PostgreSQL error: {origin.__class__.__name__}. {origin}"
    if isinstance(origin, OSError):
        return f"Network error while connecting to the database host: {origin}"

    return str(exc)


async def initialize_database() -> None:        #Creates all database tables if they don’t exist.
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    except Exception as exc:
        message = await _interpret_db_exception(exc)
        logger.exception("Database initialization failed: %s", message)
        raise RuntimeError(
            "Database initialization failed: " + message
        ) from exc


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
