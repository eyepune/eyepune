-- ============================================================
-- LEAD SCORING & INTENT INTELLIGENCE
-- Adds scoring capabilities to the master leads table
-- ============================================================

-- 1. Add Scoring Columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intent_label TEXT DEFAULT 'cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create Scoring Logic Function
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS TRIGGER AS $$
DECLARE
    new_score INTEGER := 0;
BEGIN
    -- Base score by source
    IF NEW.source = 'ai_assessment' THEN new_score := new_score + 50;
    ELSIF NEW.source = 'consultation_booking' THEN new_score := new_score + 40;
    ELSIF NEW.source = 'chatbot' THEN new_score := new_score + 20;
    ELSIF NEW.source = 'website_inquiry' THEN new_score := new_score + 30;
    END IF;

    -- Add points for data completeness
    IF NEW.phone IS NOT NULL THEN new_score := new_score + 10; END IF;
    IF NEW.company IS NOT NULL THEN new_score := new_score + 10; END IF;
    
    -- Add points for message length (intent signal)
    IF length(COALESCE(NEW.message, '')) > 100 THEN new_score := new_score + 20;
    ELSIF length(COALESCE(NEW.message, '')) > 50 THEN new_score := new_score + 10;
    END IF;

    -- Set intent label based on score
    NEW.score := new_score;
    IF new_score >= 80 THEN NEW.intent_label := 'hot';
    ELSIF new_score >= 50 THEN NEW.intent_label := 'warm';
    ELSE NEW.intent_label := 'cold';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Scoring Trigger
DROP TRIGGER IF EXISTS tr_calculate_lead_score ON leads;
CREATE TRIGGER tr_calculate_lead_score
BEFORE INSERT OR UPDATE OF source, message, phone, company ON leads
FOR EACH ROW EXECUTE FUNCTION calculate_lead_score();

-- 4. Initial Score Backfill
UPDATE leads SET score = 0 WHERE score IS NULL;
