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
