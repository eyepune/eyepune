-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the Knowledge Base table
create table lex_knowledge_base (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references organizations(id) not null,
    title varchar(255) not null,
    content text not null,
    source_type varchar(50) check (source_type in ('Act', 'Precedent', 'Custom')),
    embedding vector(1024), -- NVIDIA NIM snowflake/arctic-embed-l or nv-embedqa-e5-v5 dimension
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table lex_knowledge_base enable row level security;

-- Policies
create policy "Users can view org knowledge base"
on lex_knowledge_base for select
using (organization_id in (select organization_id from profiles where id = auth.uid()));

create policy "Users can insert org knowledge base"
on lex_knowledge_base for insert
with check (organization_id in (select organization_id from profiles where id = auth.uid()));

-- Create an HNSW index for fast similarity search
create index on lex_knowledge_base using hnsw (embedding vector_cosine_ops);

-- Create a Postgres function for similarity search (to be called via RPC)
create or replace function match_legal_context (
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  org_id uuid
)
returns table (
  id uuid,
  title varchar,
  content text,
  similarity float
)
language sql stable
as $$
  select
    lex_knowledge_base.id,
    lex_knowledge_base.title,
    lex_knowledge_base.content,
    1 - (lex_knowledge_base.embedding <=> query_embedding) as similarity
  from lex_knowledge_base
  where lex_knowledge_base.organization_id = org_id
    and 1 - (lex_knowledge_base.embedding <=> query_embedding) > match_threshold
  order by lex_knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;
