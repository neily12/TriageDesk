# 🛡️ TriageDesk

AI-powered support ticket triage with human-in-the-loop guardrails.

## What it does

Companies get flooded with support messages. TriageDesk uses an LLM to classify each ticket (category, urgency, sentiment), draft a reply, and route it to a human approval queue. Nothing is ever sent without human sign-off.

## Architecture


- **Frontend:** Next.js + React + Tailwind CSS
- **Backend:** Next.js API routes (server-side only)
- **AI:** OpenAI GPT-4o-mini
- **Validation:** Zod (input + AI output validation)

## Security & Guardrails

This project was built to demonstrate AI integration with proper upstream safeguards:

1. **Input validation** — Zod schema rejects empty/oversized input before it reaches the AI
2. **Prompt injection mitigation** — Untrusted ticket text is wrapped in delimited tags with explicit instructions to treat it as data, not instructions
3. **AI output validation** — The model's response is validated against a strict Zod schema before use
4. **Human-in-the-loop** — Every AI draft requires explicit human approval before "sending"
5. **Uncertainty escalation** — Low-confidence classifications are flagged for priority human review
6. **Server-side API key** — LLM calls happen in API routes only; no secrets exposed to the browser
7. **Rate limiting** — Caps requests to prevent abuse and cost overruns

## Demo

https://drive.google.com/file/d/1RGRwFbe9bwuM3zIxcb2NfZi6oRDV-qLC/view?usp=drive_link

## Running locally

1. Clone the repo
2. `npm install`
3. Create `.env.local` with `OPENAI_API_KEY=your-key`
4. `npm run dev`
5. Open http://localhost:3000

## What I'd add in production

- Persistent database (Supabase/Postgres)
- Authentication and role-based access
- Audit log of all AI decisions
- Redis-backed rate limiting for multi-instance deployments
- Response quality monitoring and feedback loops
