# DishaAI — Government of India Technology Architecture
### Ministry of Skill Development & Entrepreneurship (MSDE) & Digital India

This document outlines the architecture implemented in Disha AI to satisfy MSDE, Digital India, and Bhashini standards.

---

## 1. Government Stack Mapping

| Layer | Implementation | Notes |
| :--- | :--- | :--- |
| **Identity & Authentication** | **Firebase Authentication** | Google OAuth & Email/Password login with secure client SDK |
| **Multilingual AI & Translation** | **Bhashini (Digital India Bhashini Division, MeitY)** | Neural Machine Translation across 22 Scheduled Indian Languages |
| **Vocational Schemes & Data** | **Skill India Digital Hub (SIDH) / NSDC / DGT & API Setu** | Official course listings, PMKVY, NAPS, and ITI trade data |
| **Skill Standards & Qualifications** | **National Qualifications Register (NQR)** | NSQF (National Skills Qualifications Framework) qualification packs |
| **AI Reasoning Engine** | **Google Gemini & OpenRouter** | Grounded AI with Prompt-Injection Defense & Guardrails |

---

## 2. Integrated Government Modules

### A. Bhashini (MeitY National Language Translation Mission)
- **Location:** [`lib/gov/bhashini.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/lib/gov/bhashini.ts) & [`app/api/gov/bhashini/route.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/app/api/gov/bhashini/route.ts)
- **UI:** [`components/gov/LanguageSelector.tsx`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/components/gov/LanguageSelector.tsx)
- **Features:**
  - 22 Scheduled Indian languages supported (Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Urdu, English).
  - Two-way translation bridge in AI Counsellor (`/api/ai/counsel`):
    - Non-English student query is translated to English via Bhashini for grounded RAG matching against verified MSDE datasets.
    - AI answer is translated back into the student's mother tongue via Bhashini.

### B. Skill India Digital Hub (SIDH) & MSDE Verified Schemes
- **Location:** [`lib/gov/skill-india.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/lib/gov/skill-india.ts) & [`app/api/gov/skills/route.ts`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/app/api/gov/skills/route.ts)
- **UI:** [`components/gov/GovSchemesCard.tsx`](file:///Users/harshsingh/Desktop/Disha%20AI/dishaai/components/gov/GovSchemesCard.tsx)
- **Features:**
  - Official PMKVY 4.0 (Pradhan Mantri Kaushal Vikas Yojana) course listings and Direct Benefit Transfer (DBT) subsidies.
  - NAPS (National Apprenticeship Promotion Scheme) monthly stipends and application pathways.
  - Craftsmen Training Scheme (CTS - Government ITI) trade mappings.
  - PM Vishwakarma scheme toolkit and credit incentives.
  - Directory of Pradhan Mantri Kaushal Kendras (PMKK) and Government ITIs.

---

## 3. End-to-End Data Flow

```text
Student / Citizen
    │
    ▼
[ Firebase Authentication ] (Google OAuth / Email-Password)
    │
    ▼
[ Bhashini Language Switcher ] (User selects Hindi / Tamil / Marathi / etc.)
    │
    ▼
[ AI Counsellor Query ] ──(Bhashini NMT)──> [ Grounded English Representation ]
                                                │
                                                ▼
                               [ Skill India Digital & MSDE Data ]
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
# Authentication: Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Bhashini (Digital India Bhashini Division / MeitY)
BHASHINI_API_KEY=your_bhashini_api_key_here
BHASHINI_USER_ID=your_bhashini_user_id_here
BHASHINI_PIPELINE_ID=ai4bharat/indictrans-v2-all-gpu--t4

# Skill India Digital Hub & API Setu (MeitY / MSDE)
SKILL_INDIA_API_KEY=your_skill_india_digital_key_here
APISETU_API_KEY=your_apisetu_api_key_here
APISETU_CLIENT_ID=your_apisetu_client_id_here
```
