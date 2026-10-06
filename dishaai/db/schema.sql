-- DishaAI PostgreSQL + pgvector baseline schema
--
-- This file is intended to be the first database migration. It is safe to
-- re-run for the objects it owns: extensions, tables, indexes, triggers, and
-- policies use IF NOT EXISTS or are replaced deliberately. Run it with a
-- trusted migration connection, never from a browser request.
--
-- Authentication note: auth_user_id is deliberately provider-agnostic. The
-- RLS helper reads a trusted request.jwt.claim.sub value (or the app-specific
-- app.auth_user_id setting) after an authentication adapter has verified the
-- request. Clerk is not wired by this SQL file and is not assumed to be
-- enforced until the application adapter and middleware are implemented.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Keep updated_at consistent for mutable records.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Provider-neutral identity boundary for row-level security.
-- A trusted API/database gateway should set request.jwt.claim.sub, or set
-- app.auth_user_id locally for the transaction after verifying the provider
-- session. An unset value intentionally matches no user-owned row.
CREATE OR REPLACE FUNCTION public.current_auth_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('app.auth_user_id', true), '')
  );
$$;

-- Application users/profiles. Student-specific onboarding fields live here so
-- the schema can represent the current StudentProfile TypeScript shape without
-- coupling the identity key to Clerk, Supabase, or another provider.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text NOT NULL UNIQUE,
  email text,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'parent', 'admin')),
  avatar_url text,
  education_level text
    CHECK (education_level IS NULL OR education_level IN (
      'class_8', 'class_9', 'class_10', 'class_11', 'class_12',
      'iti', 'diploma', 'graduate'
    )),
  stream text,
  class_year text,
  interests text[] NOT NULL DEFAULT '{}'::text[],
  learning_preference text
    CHECK (learning_preference IS NULL OR learning_preference IN (
      'practical', 'theoretical', 'mixed'
    )),
  work_environment text
    CHECK (work_environment IS NULL OR work_environment IN (
      'indoor', 'outdoor', 'mixed', 'remote'
    )),
  location text,
  training_duration text
    CHECK (training_duration IS NULL OR training_duration IN (
      'short', 'medium', 'long'
    )),
  budget_range text
    CHECK (budget_range IS NULL OR budget_range IN (
      'zero', 'low', 'medium', 'high'
    )),
  career_goals text[] NOT NULL DEFAULT '{}'::text[],
  onboarding_complete boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Skills selected by a student during onboarding.
CREATE TABLE IF NOT EXISTS public.student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  skill_name text NOT NULL,
  proficiency smallint NOT NULL CHECK (proficiency BETWEEN 1 AND 5),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_skills_profile_skill_key UNIQUE (profile_id, skill_id)
);

-- Trusted source records for future RAG ingestion. Documents are not
-- instructions: consumers must pass their text to the model as untrusted data.
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_uri text,
  source_type text NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'url', 'pdf', 'csv', 'api', 'other')),
  content_hash text UNIQUE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'ready', 'failed', 'archived')),
  is_trusted boolean NOT NULL DEFAULT false,
  created_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Chunks are independently retrievable. Embeddings use 768 dimensions; the
-- configured embedding model must produce the same dimension before insertion.
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0),
  content text NOT NULL,
  embedding vector(768),
  embedding_model text,
  token_count integer CHECK (token_count IS NULL OR token_count >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT knowledge_chunks_document_index_key UNIQUE (document_id, chunk_index)
);

-- A conversation belongs to one application profile. The profile_id is the
-- ownership boundary used by the RLS policies below.
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_id text,
  title text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  provider text,
  model text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Server-side security and product events. Keep user text out of metadata
-- unless there is an explicit retention/redaction policy.
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_auth_user_id text,
  event_type text NOT NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  severity text NOT NULL DEFAULT 'info'
    CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Access-path indexes.
CREATE INDEX IF NOT EXISTS profiles_role_idx
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS student_skills_profile_idx
  ON public.student_skills (profile_id);

CREATE INDEX IF NOT EXISTS knowledge_documents_status_trusted_idx
  ON public.knowledge_documents (status, is_trusted);

CREATE INDEX IF NOT EXISTS knowledge_documents_metadata_gin_idx
  ON public.knowledge_documents USING gin (metadata);

CREATE INDEX IF NOT EXISTS knowledge_chunks_document_idx
  ON public.knowledge_chunks (document_id, chunk_index);

CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_gin_idx
  ON public.knowledge_chunks USING gin (metadata);

-- pgvector cosine distance index for semantic retrieval, e.g.
-- ORDER BY embedding <=> :query_embedding LIMIT :k.
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_cosine_idx
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS conversations_profile_created_idx
  ON public.conversations (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON public.messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS audit_events_type_created_idx
  ON public.audit_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_events_actor_created_idx
  ON public.audit_events (actor_auth_user_id, created_at DESC);

-- Mutable-table timestamps. DROP + CREATE makes this section re-runnable if a
-- migration is applied more than once.
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS student_skills_set_updated_at ON public.student_skills;
CREATE TRIGGER student_skills_set_updated_at
  BEFORE UPDATE ON public.student_skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS knowledge_documents_set_updated_at ON public.knowledge_documents;
CREATE TRIGGER knowledge_documents_set_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS knowledge_chunks_set_updated_at ON public.knowledge_chunks;
CREATE TRIGGER knowledge_chunks_set_updated_at
  BEFORE UPDATE ON public.knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS conversations_set_updated_at ON public.conversations;
CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ownership helpers. They intentionally return false when no trusted identity
-- is present, so an unauthenticated request cannot match an application row.
CREATE OR REPLACE FUNCTION public.owns_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = profile_id
      AND p.auth_user_id = public.current_auth_user_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_conversation(conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations AS c
    JOIN public.profiles AS p ON p.id = c.profile_id
    WHERE c.id = conversation_id
      AND p.auth_user_id = public.current_auth_user_id()
  );
$$;

-- Knowledge and audit rows are not end-user readable by default. The named
-- server roles are an explicit allow-list; an authenticated admin profile may
-- also access them. Adjust the role names only as part of the deployment's
-- privileged database-role setup. This does not connect or configure Clerk.
CREATE OR REPLACE FUNCTION public.is_admin_or_server()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT current_user IN ('postgres', 'service_role', 'disha_server')
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.auth_user_id = public.current_auth_user_id()
        AND p.role = 'admin'
    );
$$;

-- Enable and force RLS on all application tables. Service roles/superusers
-- with BYPASSRLS still need to be kept server-side and least-privileged.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills FORCE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

-- Recreate policies so this baseline can be safely re-applied.
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  USING (auth_user_id = public.current_auth_user_id());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  WITH CHECK (auth_user_id = public.current_auth_user_id());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  USING (auth_user_id = public.current_auth_user_id())
  WITH CHECK (auth_user_id = public.current_auth_user_id());

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own
  ON public.profiles FOR DELETE
  USING (auth_user_id = public.current_auth_user_id());

DROP POLICY IF EXISTS student_skills_select_own ON public.student_skills;
CREATE POLICY student_skills_select_own
  ON public.student_skills FOR SELECT
  USING (public.owns_profile(profile_id));

DROP POLICY IF EXISTS student_skills_insert_own ON public.student_skills;
CREATE POLICY student_skills_insert_own
  ON public.student_skills FOR INSERT
  WITH CHECK (public.owns_profile(profile_id));

DROP POLICY IF EXISTS student_skills_update_own ON public.student_skills;
CREATE POLICY student_skills_update_own
  ON public.student_skills FOR UPDATE
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

DROP POLICY IF EXISTS student_skills_delete_own ON public.student_skills;
CREATE POLICY student_skills_delete_own
  ON public.student_skills FOR DELETE
  USING (public.owns_profile(profile_id));

DROP POLICY IF EXISTS conversations_select_own ON public.conversations;
CREATE POLICY conversations_select_own
  ON public.conversations FOR SELECT
  USING (public.owns_profile(profile_id));

DROP POLICY IF EXISTS conversations_insert_own ON public.conversations;
CREATE POLICY conversations_insert_own
  ON public.conversations FOR INSERT
  WITH CHECK (public.owns_profile(profile_id));

DROP POLICY IF EXISTS conversations_update_own ON public.conversations;
CREATE POLICY conversations_update_own
  ON public.conversations FOR UPDATE
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

DROP POLICY IF EXISTS conversations_delete_own ON public.conversations;
CREATE POLICY conversations_delete_own
  ON public.conversations FOR DELETE
  USING (public.owns_profile(profile_id));

DROP POLICY IF EXISTS messages_select_own ON public.messages;
CREATE POLICY messages_select_own
  ON public.messages FOR SELECT
  USING (public.owns_conversation(conversation_id));

DROP POLICY IF EXISTS messages_insert_own ON public.messages;
CREATE POLICY messages_insert_own
  ON public.messages FOR INSERT
  WITH CHECK (public.owns_conversation(conversation_id));

DROP POLICY IF EXISTS messages_update_own ON public.messages;
CREATE POLICY messages_update_own
  ON public.messages FOR UPDATE
  USING (public.owns_conversation(conversation_id))
  WITH CHECK (public.owns_conversation(conversation_id));

DROP POLICY IF EXISTS messages_delete_own ON public.messages;
CREATE POLICY messages_delete_own
  ON public.messages FOR DELETE
  USING (public.owns_conversation(conversation_id));

-- No general authenticated-user policy exists on knowledge or audit data.
-- These policies intentionally require an explicitly privileged server role or
-- an authenticated admin profile; until the application adapter is wired,
-- callers must use a trusted server-side database connection.
DROP POLICY IF EXISTS knowledge_documents_admin_or_server ON public.knowledge_documents;
CREATE POLICY knowledge_documents_admin_or_server
  ON public.knowledge_documents FOR ALL
  USING (public.is_admin_or_server())
  WITH CHECK (public.is_admin_or_server());

DROP POLICY IF EXISTS knowledge_chunks_admin_or_server ON public.knowledge_chunks;
CREATE POLICY knowledge_chunks_admin_or_server
  ON public.knowledge_chunks FOR ALL
  USING (public.is_admin_or_server())
  WITH CHECK (public.is_admin_or_server());

DROP POLICY IF EXISTS audit_events_admin_or_server ON public.audit_events;
CREATE POLICY audit_events_admin_or_server
  ON public.audit_events FOR ALL
  USING (public.is_admin_or_server())
  WITH CHECK (public.is_admin_or_server());

-- Vector similarity search RPC function for pgvector knowledge chunks
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.chunk_index,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMIT;
