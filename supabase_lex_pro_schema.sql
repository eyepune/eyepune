-- Lex Pro Multi-Tenant Database Schema

-- 1. Organizations (Firms / CA / CS Practices)
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Law Firm', 'CA Practice', 'CS Practice', 'Business')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. User Profiles (Extending Supabase Auth Users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    full_name VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('Admin', 'Partner', 'Associate', 'Client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Contracts
CREATE TABLE lex_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    contract_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Reviewing', 'Ready', 'Signed')),
    content TEXT,
    risk_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lex_contracts ENABLE ROW LEVEL SECURITY;

-- 4. Contract Risk Analyses
CREATE TABLE lex_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES lex_contracts(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    summary TEXT,
    clauses JSONB, -- Stores the array of clause objects (title, risk, description, recommendation)
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lex_analyses ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" 
ON organizations FOR SELECT 
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Profiles: Users can see profiles in their own organization
CREATE POLICY "Users can view members of their organization" 
ON profiles FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Contracts: Users can CRUD contracts in their own organization
CREATE POLICY "Users can view org contracts" 
ON lex_contracts FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert org contracts" 
ON lex_contracts FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update org contracts" 
ON lex_contracts FOR UPDATE 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Analyses: Users can view analyses for contracts in their org
CREATE POLICY "Users can view org analyses" 
ON lex_analyses FOR SELECT 
USING (contract_id IN (
    SELECT id FROM lex_contracts 
    WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
));
