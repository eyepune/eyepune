-- ============================================================
-- UNIFIED LEAD SYNCHRONIZATION SYSTEM
-- Automatically populates the 'leads' table from all sources
-- ============================================================

-- 1. Create the Master Lead Sync Function
CREATE OR REPLACE FUNCTION sync_to_master_leads()
RETURNS TRIGGER AS $$
DECLARE
    existing_lead_id UUID;
    lead_source TEXT;
BEGIN
    -- Determine source based on table name
    IF TG_TABLE_NAME = 'inquiries' THEN lead_source := 'website_inquiry';
    ELSIF TG_TABLE_NAME = 'bookings' THEN lead_source := 'consultation_booking';
    ELSIF TG_TABLE_NAME = 'ai_assessments' THEN lead_source := 'ai_assessment';
    ELSIF TG_TABLE_NAME = 'chat_sessions' THEN lead_source := 'chatbot';
    ELSE lead_source := 'unknown';
    END IF;

    -- Check if lead already exists by email
    SELECT id INTO existing_lead_id FROM leads WHERE email = NEW.email LIMIT 1;

    IF existing_lead_id IS NOT NULL THEN
        -- Update existing lead
        UPDATE leads 
        SET 
            last_active = NOW(),
            source = lead_source,
            notes = COALESCE(notes, '') || E'\n---\n[' || lead_source || E' - ' || NOW()::TEXT || E']:\n' || COALESCE(NEW.message, 'No message provided')
        WHERE id = existing_lead_id;
    ELSE
        -- Create new lead
        INSERT INTO leads (
            full_name,
            email,
            phone,
            source,
            status,
            notes,
            created_at
        ) VALUES (
            COALESCE(NEW.full_name, 'Unknown Lead'),
            NEW.email,
            COALESCE(NEW.phone, NULL),
            lead_source,
            'new',
            'Initial capture from ' || lead_source || E': ' || COALESCE(NEW.message, 'No message'),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach Triggers to Capture Tables

-- Inquiries Trigger
DROP TRIGGER IF EXISTS tr_sync_inquiry_to_lead ON inquiries;
CREATE TRIGGER tr_sync_inquiry_to_lead
AFTER INSERT ON inquiries
FOR EACH ROW EXECUTE FUNCTION sync_to_master_leads();

-- Bookings Trigger
DROP TRIGGER IF EXISTS tr_sync_booking_to_lead ON bookings;
CREATE TRIGGER tr_sync_booking_to_lead
AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION sync_to_master_leads();

-- Assessments Trigger (Note: uses 'email' field)
DROP TRIGGER IF EXISTS tr_sync_assessment_to_lead ON ai_assessments;
CREATE TRIGGER tr_sync_assessment_to_lead
AFTER INSERT ON ai_assessments
FOR EACH ROW EXECUTE FUNCTION sync_to_master_leads();

-- 3. Backfill Existing Data (Optional but recommended)
-- This ensures all previous inquiries/bookings are now in the leads table
INSERT INTO leads (full_name, email, phone, source, status, created_at)
SELECT full_name, email, phone, 'backfill_inquiry', 'new', created_at
FROM inquiries
ON CONFLICT (email) DO NOTHING;

INSERT INTO leads (full_name, email, phone, source, status, created_at)
SELECT full_name, email, phone, 'backfill_booking', 'new', created_at
FROM bookings
ON CONFLICT (email) DO NOTHING;
