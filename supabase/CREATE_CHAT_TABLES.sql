-- Chat Monitoring Tables
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    intent_score INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for public access (Chatbot)
DROP POLICY IF EXISTS "Allow public chat creation" ON chat_sessions;
CREATE POLICY "Allow public chat creation" ON chat_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public message insertion" ON chat_messages;
CREATE POLICY "Allow public message insertion" ON chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anyone to read chats" ON chat_sessions;
CREATE POLICY "Allow anyone to read chats" ON chat_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anyone to read messages" ON chat_messages;
CREATE POLICY "Allow anyone to read messages" ON chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service updates" ON chat_sessions;
CREATE POLICY "Allow service updates" ON chat_sessions FOR UPDATE USING (true);
