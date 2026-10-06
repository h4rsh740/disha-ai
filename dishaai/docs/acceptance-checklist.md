# DishaAI acceptance checklist

## User-visible baseline

- [ ] A visitor can open the home page and enter the five-step onboarding flow.
- [ ] Continue is blocked until each step has the required answers; Back works.
- [ ] Completing onboarding returns to the dashboard and preserves answers after
  a reload in the same browser.
- [ ] The dashboard shows deterministic career matches, Career Twin metrics, and
  the visible **Demo Mode — Illustrative Data** notice.
- [ ] Career, family, and counsellor screens remain usable when AI keys are
  absent; the UI receives a friendly fallback instead of a raw secret/error.
- [x] `/api/health` reports local security/retrieval readiness and provider,
  database, and authentication configuration presence without returning secrets.
- [ ] No user-facing screen claims that Clerk, PostgreSQL/pgvector, RAG, or
  persistent audit storage is connected until those integrations are wired.

## Integration gate

- [ ] Clerk session is verified server-side and mapped to `profiles.auth_user_id`.
- [ ] Profile, skills, conversations, and messages are persisted and isolated by
  RLS; knowledge and audit data remain server/admin-only.
- [ ] Reviewed documents are chunked, embedded at 768 dimensions, and retrieved
  through the pgvector cosine index.
- [x] Input checks, prompt-injection defenses, and output validation run on the
  current local AI routes.
- [ ] Redacted security/product events persist to `audit_events` on the
  authenticated production path.

## Verification commands

```bash
npm install
npm run lint
npm run build
git diff --check
```

For a configured PostgreSQL environment, apply and inspect the baseline:

```bash
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
psql "$DIRECT_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "SELECT to_regclass('public.profiles'), to_regclass('public.student_skills'), to_regclass('public.knowledge_documents'), to_regclass('public.knowledge_chunks'), to_regclass('public.conversations'), to_regclass('public.messages'), to_regclass('public.audit_events');"
```
