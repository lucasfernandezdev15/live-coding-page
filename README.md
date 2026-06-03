# DevProbe

Frontend live-coding interview practice (Next.js 15).

## Live app

**Use this URL (current deployment):**

https://live-coding-page.vercel.app

> `live-coding-test.vercel.app` is a different Vercel project (“Simple Budget App”) and does **not** receive updates from this repo.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Copy `.env.example` to `.env.local`. Optional:

- `GEMINI_API_KEY` — free-tier hints (recommended)
- `ANTHROPIC_API_KEY` — optional, takes priority when set

On Vercel: **Settings → Environment Variables** → same keys → redeploy.
