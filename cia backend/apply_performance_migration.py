"""
Apply performance optimization indexes to the database.
Run this script once to add indexes for faster queries.
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None or not DATABASE_URL.strip():
    raise RuntimeError("DATABASE_URL is missing. Add it to your .env file.")

DATABASE_URL = DATABASE_URL.strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


async def apply_indexes():
    """Apply performance indexes to the database."""
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_interview_sessions_started_at ON interview_sessions(started_at);",
        "CREATE INDEX IF NOT EXISTS idx_question_feedback_interview_id ON question_feedback(interview_id);",
    ]
    
    async with engine.begin() as conn:
        print("Applying performance indexes...")
        for idx, sql in enumerate(indexes, 1):
            print(f"\n[{idx}/{len(indexes)}] Executing: {sql}")
            await conn.execute(text(sql))
            print(f"✓ Index {idx} applied successfully")
        
        print("\n" + "="*60)
        print("All indexes applied successfully!")
        print("="*60)
        
        # Verify indexes
        print("\nVerifying indexes...")
        result = await conn.execute(text("""
            SELECT tablename, indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename IN ('users', 'interview_sessions', 'question_feedback')
            ORDER BY tablename, indexname;
        """))
        
        print("\nCurrent indexes:")
        for row in result:
            print(f"  - {row[0]}.{row[1]}")
    
    await engine.dispose()


if __name__ == "__main__":
    print("Performance Optimization Migration")
    print("="*60)
    asyncio.run(apply_indexes())
