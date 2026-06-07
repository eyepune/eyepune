-- ═══════════════════════════════════════════════════════════════════
-- WhatsApp Business API Tables for EyE PunE
-- Run this in your Supabase SQL Editor to create the required tables
-- ═══════════════════════════════════════════════════════════════════

-- 1. WHATSAPP SEQUENCES TABLE
-- Stores automated message flow configurations
CREATE TABLE IF NOT EXISTS public.whatsapp_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL DEFAULT 'new_inquiry',
    template_name TEXT NOT NULL,
    language_code TEXT DEFAULT 'en_US',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.whatsapp_sequences ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "whatsapp_sequences_admin_all" ON public.whatsapp_sequences
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Service role bypass for API routes
CREATE POLICY "whatsapp_sequences_service_role" ON public.whatsapp_sequences
    FOR ALL
    USING (auth.role() = 'service_role');


-- 2. WHATSAPP MESSAGES TABLE
-- Stores all inbound/outbound WhatsApp messages for audit trail
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wa_message_id TEXT,
    from_number TEXT NOT NULL,
    to_number TEXT DEFAULT '',
    direction TEXT NOT NULL DEFAULT 'inbound', -- 'inbound' or 'outbound'
    message_type TEXT DEFAULT 'text',           -- text, template, image, etc.
    content TEXT DEFAULT '',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    raw_payload TEXT,                           -- Full JSON payload for debugging
    status TEXT DEFAULT 'received',             -- received, sent, delivered, read, failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "whatsapp_messages_admin_all" ON public.whatsapp_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Service role bypass for webhook inserts
CREATE POLICY "whatsapp_messages_service_role" ON public.whatsapp_messages
    FOR ALL
    USING (auth.role() = 'service_role');


-- 3. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_wa_messages_from ON public.whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_wa_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_wa_messages_timestamp ON public.whatsapp_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wa_sequences_trigger ON public.whatsapp_sequences(trigger_type);
CREATE INDEX IF NOT EXISTS idx_wa_sequences_status ON public.whatsapp_sequences(status);
