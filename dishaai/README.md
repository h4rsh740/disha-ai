# DishaAI 🎓
### "Helping students choose careers. Helping families understand them."

**Smart India Hackathon 2026 — Problem SIH26241**  
Ministry of Skill Development and Entrepreneurship (MSDE) · Smart Education

---

## What is DishaAI?

DishaAI is an AI-powered career counselling and family decision-support platform for vocational education in India. It helps students discover suitable vocational career pathways and helps their families understand why the career is suitable, what training is needed, and what the future holds.

**This is NOT a generic AI chatbot and NOT a generic job portal.**  
The core product is: **Student + Family Career Decision Intelligence.**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local and add your Gemini API key

# 3. Run development server
npm run dev

# Open http://localhost:3000
```

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI Components**: Custom design system (Navy/Cyan brand)
- **AI Layer**: Gemini API (primary) + OpenRouter (fallback)
- **Recommendation Engine**: Deterministic, explainable scoring
- **Database**: Supabase PostgreSQL (designed, not yet connected)
- **Charts**: Recharts
- **Security/RAG foundation**: bounded input validation, prompt-injection screening,
  deterministic local retrieval, explicit untrusted-data delimiters, output guardrails,
  and a PostgreSQL/pgvector schema artifact

### AI Provider Architecture

```
Application Feature
        ↓
     AI Router (/lib/ai/router.ts)
        ↓
   ┌────┴────┐
   ↓         ↓
Gemini    OpenRouter
Primary     Backup
   ↓         ↓
   └────┬────┘
        ↓
 Unified AI Response
```

**Key rules:**
- All AI API keys are server-side only (never `NEXT_PUBLIC_*`)
- Application features NEVER call AI providers directly — always through `/lib/ai/provider.ts`
- Automatic failover on 429, 503, 5xx, or timeout
- All prompts are grounded — AI cannot invent government schemes, salary figures, or official statistics

---

## Project Structure

```
dishaai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── onboarding/page.tsx         # 5-step student assessment
│   ├── dashboard/page.tsx          # Career Twin + top matches
│   ├── careers/
│   │   ├── page.tsx                # All career recommendations
│   │   └── [id]/page.tsx           # Career detail + skill analysis
│   ├── career-path/
│   │   └── [id]/page.tsx           # Career Path Simulator (Hero Feature 1)
│   ├── family/
│   │   ├── page.tsx                # Family Decision Mode (Hero Feature 2)
│   │   └── report/page.tsx         # Printable family career report
│   ├── counsellor/page.tsx         # AI Career Counsellor chat
│   ├── admin/page.tsx              # Analytics dashboard
│   ├── api/health/route.ts         # Safe runtime/configuration probe
│   └── api/ai/
│       ├── explain-career/route.ts # Career explanation API
│       ├── family-faq/route.ts     # FAQ answer API
│       ├── family-report/route.ts  # Report generation API
│       └── counsel/route.ts        # Chat API
├── lib/
│   ├── ai/
│   │   ├── provider.ts             # Unified AI service layer
│   │   ├── router.ts               # Gemini → OpenRouter failover
│   │   ├── gemini.ts               # Gemini provider
│   │   ├── openrouter.ts           # OpenRouter provider
│   │   ├── prompts.ts              # Grounded AI prompts
│   │   └── types.ts                # AI type definitions
│   ├── recommendation/
│   │   └── engine.ts               # Deterministic scoring engine
│   ├── knowledge/retrieval.ts      # Local lexical RAG adapter
│   ├── security/                   # Input, injection, output, and request controls
│   └── utils.ts
├── components/
│   ├── layout/Sidebar.tsx          # Navigation sidebar + TopNav
│   ├── career/
│   │   ├── CareerCard.tsx          # Career match card
│   │   └── CareerTimeline.tsx      # Interactive career path timeline
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       └── Progress.tsx            # Progress bar + ScoreRing
├── data/
│   └── careers.ts                  # Knowledge base (10 vocational careers)
├── db/schema.sql                    # PostgreSQL + pgvector baseline
├── docs/                            # PDF workflow and deployment runbooks
└── types/index.ts                   # Full TypeScript types
```

---

## Recommendation Engine

Weighted scoring across 5 dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Interest Match | 35% | Maps student interests to career categories |
| Skill Match | 25% | Existing skills vs required skills |
| Market Demand | 20% | Relative demand indicator (illustrative) |
| Education Fit | 10% | Education level vs career requirement |
| Financial Fit | 10% | Training budget vs cost |

**Output**: Ranked career list with match score, explanation bullets, skill gaps, and career twin profile.

---

## Hero Features

### 1. Career Path Simulator
Interactive step-by-step career journey from current education to senior roles. Compare ITI vs Diploma pathways side by side with a "What If?" comparison table.

### 2. Family Decision Mode
Designed for Indian parents — plain language, no jargon. AI-answered FAQ cards (Is this career stable? Can my child study further? etc.) plus a printable career report.

---

## Adding Your API Keys

Edit `.env.local`:

```env
GEMINI_API_KEY=your_key_from_aistudio.google.com
OPENROUTER_API_KEY=your_key_from_openrouter.ai
```

The app works without keys — AI features return graceful fallbacks when keys are not set.

---

## Demo Data Notice

> **All career information and analytics in this application are illustrative data for SIH26241 demonstration purposes only.**
> 
> Salary ranges, job demand figures, government scheme details, and cost estimates are NOT official statistics.
> 
> Verify all career information with official sources: NSDC, MSDE, Skill India, or the relevant State Skill Development Mission.

---

## Troubleshooting browser-extension errors

If onboarding reports either of these errors in development:

- A hydration attribute mismatch containing `bis_skin_checked="1"`: an extension has changed the HTML before React hydrated it. This attribute is not emitted by DishaAI. The warning can include Next.js's own hidden wrapper, so adding `suppressHydrationWarning` to the page or body is not a repair.
- `Cannot read properties of undefined (reading 'M_ID')`, with a stack under `chrome-extension://nimlmejbmnecnaghgmbahmbaddhjbecg/executors/200.js`: the failing script belongs to **Urban VPN Proxy for Edge**, not application code.

To resolve this in the affected Edge profile:

1. Open `edge://extensions` and temporarily turn off Urban VPN Proxy while testing localhost, or restrict its site access so it cannot run on localhost.
2. Temporarily disable other DOM-modifying browser extensions for local testing. Re-enable them individually to identify the extension adding `bis_skin_checked`. Do not disable system antivirus protection.
3. Hard-refresh `http://localhost:3000/onboarding` with **Cmd+Shift+R** on macOS (**Ctrl+Shift+R** on Windows). No need to clear your saved answers or reinstall project dependencies.
4. Alternatively, use a fresh Edge profile or InPrivate window, ensuring the affected extensions are **not allowed in InPrivate**.
5. Verify that the console has no hydration or runtime errors, then complete Education → Interests → Skills → Preferences → Goals and confirm the dashboard reads back the profile after a reload.

The five-step flow was verified in isolated, extension-free Edge contexts at desktop and mobile widths. The affected external browser profile still needs the configuration change above; workspace code cannot repair an extension's internal `M_ID` exception.

References: [Next.js hydration troubleshooting](https://nextjs.org/docs/messages/react-hydration-error) · [Urban VPN Proxy extension identification](https://chrome-stats.com/d/nimlmejbmnecnaghgmbahmbaddhjbecg).

---

## About

**DishaAI** was built for Smart India Hackathon 2026, Problem Statement SIH26241  
Organised by: Ministry of Skill Development and Entrepreneurship (MSDE)  
Theme: Smart Education · Category: Software
