-- Performance Optimization: Add Database Indexes
-- Run this SQL script on your PostgreSQL database to add performance indexes

-- Add index on users.email for faster login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add index on interview_sessions.user_id for faster user queries
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);

-- Add index on interview_sessions.started_at for faster sorting and date queries
CREATE INDEX IF NOT EXISTS idx_interview_sessions_started_at ON interview_sessions(started_at);

-- Add index on question_feedback.interview_id for faster joins
CREATE INDEX IF NOT EXISTS idx_question_feedback_interview_id ON question_feedback(interview_id);

-- Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    schemaname = 'public' 
    AND tablename IN ('users', 'interview_sessions', 'question_feedback')
ORDER BY 
    tablename, indexname;
