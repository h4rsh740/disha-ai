# DishaAI deployment runbook

This is a setup checklist for a future Vercel deployment. It describes required
configuration without asserting that external services are connected today.

## 1. Vercel environment checklist

Create separate values for **Development**, **Preview**, and **Production** in
Vercel. Never commit `.env.local`, a database URL, or an API key.

### Current AI/runtime variables

These names match `.env.example` and the current provider implementation:

- [ ] `NEXT_PUBLIC_APP_URL` — the public URL for this environment. It is safe to
  expose the URL, not credentials.
- [ ] `NODE_ENV` — `production` on Vercel.
- [ ] `GEMINI_API_KEY` — server-only Google AI Studio key.
- [ ] `GEMINI_MODEL` — model name supported by the configured Gemini API.
- [ ] `OPENROUTER_API_KEY` — server-only OpenRouter key.
- [ ] `OPENROUTER_MODEL` — OpenRouter model identifier.
- [ ] `AI_PRIMARY_PROVIDER` — `gemini` or `openrouter`.

Do not prefix provider keys with `NEXT_PUBLIC_`. The browser must never receive
them. The application currently degrades to friendly AI fallbacks when keys are
missing, but a production release should make provider readiness observable and
should not treat a fallback as verified factual advice.

### Planned identity and database variables

Add these only when the corresponding adapters are implemented; the current
repository does not read them:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase Web API key.
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase Auth domain.
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase Project ID.
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — Firebase Storage bucket.
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — Firebase Messaging sender ID.
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` — Firebase App ID.
- [ ] `DATABASE_URL` — pooled runtime PostgreSQL connection string.
- [ ] `DIRECT_DATABASE_URL` — direct/migration connection string, kept out of
  request handlers where possible.

If a managed PostgreSQL vendor supplies different variable names, use the
vendor's names in Vercel and update the database adapter explicitly. The
existing commented Supabase variables in `.env.example` are not proof that a
Supabase project is connected.

## 2. Firebase configuration

1. Create a Firebase project in the Firebase Console (https://console.firebase.google.com/).
2. Enable Authentication (Email/Password and Google OAuth).
3. Copy the web app configuration parameters to `.env.local` or Vercel Environment Variables.
4. On a verified request, map the immutable Firebase UID (`user.uid`) to `profiles.auth_user_id`.

## 3. PostgreSQL and pgvector setup

Use a PostgreSQL service that supports the `vector` extension. Run the schema
from a trusted migration environment:

```bash
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
```

The schema enables `pgcrypto` and `vector`, creates the application tables,
updated-at triggers, access indexes, an HNSW cosine index on
`knowledge_chunks.embedding`, and conservative RLS policies. The embedding
model used by the ingestion/query code must produce exactly 768 dimensions.

After the first run, verify the extension and owned objects:

```bash
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto', 'vector') ORDER BY extname;"
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "SELECT to_regclass('public.profiles'), to_regclass('public.knowledge_chunks'), to_regclass('public.audit_events');"
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "SELECT indexname FROM pg_indexes WHERE tablename = 'knowledge_chunks' AND indexname = 'knowledge_chunks_embedding_cosine_idx';"
```

Run migrations before deploying code that depends on a new column. Keep
application writes backward-compatible during a rolling Vercel deployment.
`db/schema.sql` is an idempotent baseline, not a substitute for versioned
migration history once production data exists.

## 4. Gemini and OpenRouter configuration

- Create keys in the provider consoles and add them only to the matching
  server-side Vercel environment.
- Pin and test a model through `GEMINI_MODEL` and `OPENROUTER_MODEL`; do not
  assume the model in the example is available in every account or region.
- Set `AI_PRIMARY_PROVIDER=gemini` for the documented default or choose
  `openrouter` deliberately.
- Confirm both providers use the same grounding and output-validation path.
  Provider failover must not bypass authentication, retrieval filtering, or
  guardrails.
- Rotate keys using the provider console and Vercel environment history; never
  paste a key into source, an issue, a screenshot, or a client-visible error.

## 5. Security constraints before production

- Keep `DATABASE_URL`, `DIRECT_DATABASE_URL`,
  `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, and service-role credentials server
  side only.
- Do not grant a browser client a PostgreSQL owner/service-role connection.
  Use the authenticated server route and RLS boundary.
- Apply input size/type/rate/permission checks before model or retrieval calls.
- Treat user questions, uploaded documents, and retrieved chunks as untrusted
  data; isolate them from trusted system instructions and detect prompt-injection
  attempts.
- Validate generated output for unsafe content, secret leakage, unsupported
  claims, and expected structure before returning it.
- Redact prompts, tokens, and personal data from logs. Put only controlled
  metadata in `audit_events` and define retention before enabling production
  audit writes.
- Keep illustrative career demand, salary, and scheme text labelled as demo
  data until verified against official sources.

## 6. Health checks and release gates

Before a Vercel promotion:

```bash
npm install
npm run lint
npm run build
```

After deployment, verify the current UI routes and the safe health endpoint
return successfully:

```bash
curl -fsS "$NEXT_PUBLIC_APP_URL/" >/dev/null
curl -fsS "$NEXT_PUBLIC_APP_URL/onboarding" >/dev/null
curl -fsS "$NEXT_PUBLIC_APP_URL/dashboard" >/dev/null
curl -fsS "$NEXT_PUBLIC_APP_URL/api/health" >/dev/null
```

Also inspect Vercel function logs for provider initialization errors without
printing secret values. `/api/health` reports configuration presence only; it
does not prove that a provider, database, Firebase session, or vector index is
reachable. Once those adapters are wired, add checks for an authenticated
session, a profile read, a safe AI request, and database/vector connectivity.
A successful page response alone does not prove those integrations are connected.

## 7. Rollback notes

- For an application regression, promote the last known-good Vercel deployment
  and keep the database schema at a compatible version.
- Prefer additive migrations. Do not drop columns, tables, extensions, or
  indexes as part of an emergency application rollback.
- If a migration has already changed production data, stop dependent writes,
  take/verify a database backup, and use a reviewed reverse migration or
  provider restore procedure. Do not improvise destructive SQL during a live
  incident.
- If a provider key is suspected to be exposed, revoke/rotate it at the
  provider and update the affected Vercel environments before retrying traffic.
- Record the deployment ID, migration version, provider configuration change,
  and observed error in the incident/audit trail after service is stable.
