# DishaAI architecture

This document turns the SIH workflow into an implementation map for the current
repository. The PDF describes the target flow:

**Authenticate → Understand → Validate → Protect → Retrieve → Generate → Guard → Respond → Audit**

## Status language

- **Implemented locally** means the behavior is present in this repository and
  can be exercised without external accounts.
- **Planned integration** means the architecture has a place for it, but the
  provider, adapter, or persistence path is not connected yet.
- **Gap** means the PDF describes a target control that still needs application
  code and verification.

## Current request flow

```text
Browser UI
  -> Next.js page or /app/api/ai/* route
  -> route-level validation and demo context
  -> deterministic local retrieval/recommendations and/or AI provider router
  -> JSON response or rendered page
  -> browser-local state and visible demo output
```

The current demo stores onboarding data in `localStorage` under
`disha_onboarding`. It does not create an authenticated session or persist a
profile, conversation, or message in PostgreSQL.

## PDF workflow mapped to this repository

| Stage | Current code and behavior | Status / next integration |
| --- | --- | --- |
| **Authenticate** | No Clerk package, middleware, sign-in route, or protected route is present. `app/onboarding/page.tsx` starts without a session and the AI routes accept client-supplied context. | **Planned integration / gap.** Add Clerk middleware and a server-side adapter, map the verified Clerk subject to `profiles.auth_user_id`, and pass only verified identity into database queries. The SQL schema is provider-neutral and does not itself connect Clerk. |
| **Understand** | The five-step onboarding UI validates required answers locally. `app/dashboard/page.tsx` rebuilds a `StudentProfile`-shaped object from local storage; `lib/recommendation/engine.ts` computes deterministic interest, skill, education, market-demo, and financial scores. | **Implemented locally for demo behavior.** Intent classification and server-backed session context from the PDF are not implemented. |
| **Validate** | Onboarding blocks incomplete steps. AI routes now read bounded JSON once, validate common question/history/career fields, return structured 400 errors, and cap client-supplied profile/list values before prompt construction. | **Implemented locally for current AI routes.** Add content-type, permission, rate, and upload checks before accepting production input. |
| **Protect** | `lib/security/prompt-injection.ts` and `lib/ai/pipeline.ts` inspect questions/history/retrieved chunks, block high-risk signals, and delimit allowed untrusted data. Counselling and family FAQ routes preflight the policy, and the provider layer uses the protected message path. Provider keys remain server-side. | **Implemented locally; identity boundary remains planned.** Add Clerk authorization and a least-privilege tool/data boundary. Heuristics are defense-in-depth and do not detect every attack. |
| **Retrieve** | `data/careers.ts` remains an in-process demo knowledge base. `lib/knowledge/retrieval.ts` provides deterministic lexical retrieval over demo careers and pathways, and provider calls now include the retrieved chunks as explicitly delimited data. There is no embedding call or database semantic query. | **Implemented locally as a demo; external RAG planned.** Run `db/schema.sql`, ingest reviewed documents into `knowledge_documents`/`knowledge_chunks`, generate matching 768-dimensional embeddings, and query the pgvector cosine index. Retrieval must filter to trusted/ready documents. |
| **Generate** | `lib/ai/provider.ts` is the common AI service layer. `lib/ai/router.ts` calls Gemini first by default and falls back to OpenRouter for failed/empty or recognized transient failures. Career explanation, family FAQ/report, counselling, action-plan, and skill-gap calls share the local retrieval context where applicable. | **Implemented locally when provider keys are configured; external setup remains.** Gemini and OpenRouter are not connected by this repository until their server-side environment variables are supplied. |
| **Guard** | `lib/security/guardrails.ts` now runs after provider responses from the shared provider layer. It normalizes output, detects secret leakage and instruction wrappers, rejects unsupported sensitive claims without supplied grounding tokens, and falls back to safe text/structured data. | **Implemented locally.** A prompt is not a substitute for an output guardrail; persistent review and policy tuning remain production work. |
| **Respond** | Next.js pages render onboarding, dashboard, career, family, and counsellor experiences. AI routes return JSON including the answer, provider, and fallback flag; malformed or blocked requests receive structured responses; `/api/health` reports safe configuration presence without secrets. | **Implemented locally for demo flows.** Add authenticated profile/conversation persistence and source/citation display when database-backed RAG is wired. |
| **Audit** | `lib/ai/router.ts` writes redacted provider/model/status/latency/fallback records, while `lib/security/audit.ts` records controlled rule IDs and decisions for route and output-guardrail events. `lib/ai/pipeline.ts` returns structured security metadata. No prompt text is logged by these paths, and no persistent audit event is written by the app. | **Partial local logging; planned persistence.** Persist controlled security/product metadata in `audit_events`, add request IDs, retention, monitoring, and an admin review path. The table is server/admin-only by default. |

## Data and integration boundaries

### Application data

`db/schema.sql` provides:

- `profiles` as the provider-neutral application user record, including the
  current student onboarding fields;
- `student_skills` linked to a profile;
- `conversations` and `messages` linked to a profile;
- `knowledge_documents` and `knowledge_chunks` for reviewed RAG material;
- `audit_events` for server-side security and product events.

Row-level security allows a trusted authenticated identity to access only its
own profile, skills, conversations, and messages. Knowledge and audit rows have
no general end-user policy; they require an explicitly privileged server role
or admin profile. The RLS helper assumes an adapter has already verified the
request and set a trusted database claim. It does **not** claim that the current
app enforces Clerk.

### AI providers

The application-level provider contract is already centralized in
`lib/ai/provider.ts` and `lib/ai/router.ts`:

1. Build a system instruction plus context.
2. Call the configured primary provider.
3. Retry through the alternate provider for the router's fallback conditions.
4. Return a normalized result to the route.

This keeps provider switching separate from future retrieval and guardrail
work. It does not mean either provider is configured in a deployment.

### Planned production path

```text
Clerk session
  -> authenticated Next.js server route
  -> input/permission and prompt-injection checks
  -> trusted context + pgvector retrieval
  -> Gemini/OpenRouter through the existing router
  -> output guardrails and source checks
  -> response + redacted audit event
```

External services named in the PDF are planned integrations:

| Service | Intended responsibility | Current repository state |
| --- | --- | --- |
| Clerk | Sign-in, sessions, route protection, verified subject | Not installed or wired |
| PostgreSQL + pgvector | Profiles, conversations, knowledge chunks, vector similarity, audit records | Schema artifact added; no app connection |
| Gemini | Primary generation provider | Provider client exists; requires server-side key |
| OpenRouter | Backup/gateway provider | Provider client exists; requires server-side key |
| Vercel | Web deployment and runtime environment | Deployment configuration is documented; no claim of deployment |

All document text, user questions, and retrieved passages remain untrusted
content. Only application-owned system/developer policy may define model
behavior. Demo career values and market scores remain illustrative and must not
be presented as official statistics.
