# DishaAI — Government of India Technology Architecture
### Smart India Hackathon (SIH 2026) · Ministry of Skill Development & Entrepreneurship (MSDE)

This document outlines the complete Government-native technology stack implemented in Disha AI to satisfy MSDE, Digital India, and MeitY standards.

---

## 1. Government Stack Mapping

| Layer | Traditional Stack | **Official Government of India (MeitY / MSDE) Stack** |
| :--- | :--- | :--- |
| **Identity & Authentication** | Clerk / Auth0 | **MeriPehchan (National Single Sign-On / Jan Parichay)** + **DigiLocker / APAAR ID** (Automated Permanent Academic Account Registry) |
| **Multilingual AI & Translation** | Google Translate / Proprietary NLP | **Bhashini (Digital India Bhashini Division, MeitY)** — Neural Machine Translation across 22 Scheduled Indian Languages |
| **Vocational Schemes & Data** | Static / Mock Scrapes | **Skill India Digital Hub (SIDH) / NSDC / DGT & API Setu (apisetu.gov.in)** |
| **Skill Standards & Qualifications** | Unstructured Roles | **National Qualifications Register (NQR)** & **NSQF (National Skills Qualifications Framework)** Qualification Packs (QP/NOS) |
| **AI Reasoning Engine** | Generic Unbounded LLM | **Grounded AI with Prompt-Injection Defense & MSDE Guardrails** |

---

## 2. Integrated Government Modules

### A. MeriPehchan (Jan Parichay) & DigiLocker / APAAR ID
- **Location:** [`lib/gov/meripehchan.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/lib/gov/meripehchan.ts) & [`app/api/gov/auth/route.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/app/api/gov/auth/route.ts)
- **UI:** [`components/gov/MeriPehchanLogin.tsx`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/components/gov/MeriPehchanLogin.tsx)
- **Features:**
  - Citizen single sign-on replacing commercial foreign auth providers.
  - Verification of Academic Bank of Credits (APAAR ID) and CBSE/State Board roll numbers.
  - Auto-populates student's verified profile data (education level, verified name, domicile state).

### B. Bhashini (MeitY National Language Translation Mission)
- **Location:** [`lib/gov/bhashini.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/lib/gov/bhashini.ts) & [`app/api/gov/bhashini/route.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/app/api/gov/bhashini/route.ts)
- **UI:** [`components/gov/LanguageSelector.tsx`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/components/gov/LanguageSelector.tsx)
- **Features:**
  - 22 Scheduled Indian languages supported (Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Urdu, English).
  - Two-way translation bridge in AI Counsellor (`/api/ai/counsel`):
    - Non-English student query is translated to English via Bhashini for grounded RAG matching against verified MSDE datasets.
    - AI answer is translated back into the student's mother tongue via Bhashini.

### C. Skill India Digital Hub (SIDH) & MSDE Verified Schemes
- **Location:** [`lib/gov/skill-india.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/lib/gov/skill-india.ts) & [`app/api/gov/skills/route.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/app/api/gov/skills/route.ts)
- **UI:** [`components/gov/GovSchemesCard.tsx`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/components/gov/GovSchemesCard.tsx)
- **Features:**
  - Official PMKVY 4.0 (Pradhan Mantri Kaushal Vikas Yojana) course listings and Direct Benefit Transfer (DBT) subsidies.
  - NAPS (National Apprenticeship Promotion Scheme) monthly stipends and application pathways.
  - Craftsmen Training Scheme (CTS - Government ITI) trade mappings.
  - PM Vishwakarma scheme toolkit and credit incentives.
  - Directory of Pradhan Mantri Kaushal Kendras (PMKK) and Government ITIs.

---

## 3. End-to-End Government Data Flow

```text
Citizen / Student
    │
    ▼
[ MeriPehchan / APAAR NSSO Login ] (Citizen Identity Verification)
    │
    ▼
[ Bhashini Language Switcher ] (User selects Hindi / Tamil / Marathi / etc.)
    │
    ▼
[ AI Counsellor Query ] ──(Bhashini NMT)──> [ Grounded English Representation ]
                                                    │
                                                    ▼
                                   [ Skill India Digital & MSDE RAG ]
                                   (PMKVY, NAPS, NSQF, CTS Standards)
                                                    │
                                                    ▼
                                          [ Cognitive LLM Engine ]
                                                    │
                                                    ▼
                                          [ Security Guardrails ]
                                                    │
                                                    ▼
                                   [ Bhashini NMT Return Translation ]
                                                    │
                                                    ▼
                                    Student receives response in mother tongue
```

---

## 4. Environment Variables (`.env.local`)

```env
# Bhashini (Digital India Bhashini Division / MeitY)
BHASHINI_API_KEY=your_bhashini_api_key_here
BHASHINI_USER_ID=your_bhashini_user_id_here
BHASHINI_PIPELINE_ID=ai4bharat/indictrans-v2-all-gpu--t4

# Skill India Digital Hub & API Setu (MeitY / MSDE)
SKILL_INDIA_API_KEY=your_skill_india_digital_key_here
APISETU_API_KEY=your_apisetu_api_key_here
APISETU_CLIENT_ID=your_apisetu_client_id_here

# MeriPehchan (National Single Sign-On / Jan Parichay)
MERIPEHCHAN_CLIENT_ID=your_meripehchan_client_id
MERIPEHCHAN_CLIENT_SECRET=your_meripehchan_client_secret
```

*Note: For SIH evaluation, all adapters include offline sandbox simulations so every feature functions smoothly even if external production government credentials are not yet configured.*
