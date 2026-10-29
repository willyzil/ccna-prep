# CCNA Exam Sim

Practice exams for CCNA 200-301 in the style of a commercial exam simulator:
four 100-item exams weighted like the v1.1 blueprint, drag-and-drop items,
show-command simulations and graded CLI labs on a simulated IOS, with an
explanation for every option.

- `npm run dev` + `npm run server` – Vite on :5173 proxying `/api` to the API on :8092
- `npm test` – bank validation, lab solutions replayed against their checks, sim answers
- `docker compose up -d --build` – production on 127.0.0.1:8091 (data in `./data`)

Layout: `src/sim` IOS/network simulator, `src/bank` questions and labs,
`src/exam` scoring, `src/components` UI, `server/server.mjs` API + static files.

## Accounts

Signed-in visitors keep their exams, flags and study ticks in their own
account on the self-hosted Supabase on aiserver (dashboard `https://supabase.lan`,
public API `https://supabase.velstronltd.com`, only `/auth/v1` and `/rest/v1`).
Signed out, the site works as before: history stays in the browser, or on the
ccna.lan server. After signing in, visitors are offered a copy of that history.

- `supabase/schema.sql` – the tables, row-level security and caps; safe to re-run
- `supabase/check.mjs` – checks row-level security, the caps and account deletion
  against a running instance; it needs the secret key, so run it on aiserver (see its header)
- `src/supabase.js` holds the public URL and publishable key; override them with
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, or build without accounts
  with `VITE_SUPABASE_URL=off`
