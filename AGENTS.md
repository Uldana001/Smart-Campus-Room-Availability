# AGENTS.md

## Purpose
Smart Campus Room Availability: a small front-end app that checks whether a room can be booked for a requested time. A deterministic function (`checkAvailability`) is the single source of truth. An optional "Explain availability" feature describes the decision using a MOCK adapter only (no real LLM, no network).

## Architecture
- `src/App.tsx` - UI state, input parsing, calls `checkAvailability` through a wrapper.
- `src/components/` - BookingForm, ResultCard, RoomDetails, RoomFilters, Timeline, ExplanationPanel.
- `src/lib/availability.ts` - booking rules (source of truth). `rules.ts` - constants. `interval.ts`, `filterRooms.ts` - helpers.
- `src/lib/llm/` - `explain.ts` (reason codes, validation, fallback, timeout), `mockAdapter.ts` (deterministic mock), `explain.test.ts`.
- Tests: `src/integration.test.ts`, `src/lib/*.test.ts`.
- Data is in-memory (`src/data.ts`). No backend, no login, no database.

## Setup
1. `npm install` (uses `package-lock.json`; do not change dependency versions).
2. `npm run dev` to run locally.
No environment variables are required. Never add real API keys or secrets to the repo.

## Safe commands (allowed without asking)
`npm test`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run dev`, `ls`, `cat`.
Always use `npm run typecheck` (not bare `npx tsc --noEmit`: the root tsconfig has `"files": []`, so it passes without checking anything).

## Acceptance criteria (must hold after every change)
- AC1: a valid request has start after the current time, start < end, and times within 0-1440.
- AC2: maximum booking duration is 120 minutes.
- AC3: a blocked room is rejected.
- AC4: overlap with an existing booking is rejected; touching intervals are allowed.
- AC5: availability checks never mutate booking data.
- AC6: the UI gives clear, responsive feedback.
- F1-F5: room filters keep their current behaviour.
- LLM-AC1..LLM-AC5: the explanation never changes the availability decision; invalid input or output, errors, or a timeout (3000 ms) fall back to a deterministic text; the UI label "Generated explanation (mock) - not a booking confirmation" stays; adapter input is only `{roomLabel, start, end, isAvailable, reasonCodes}`; only the mock adapter is used. A real API may only be called server-side, with human approval.

## Conventions
- TypeScript, functional React components, Tailwind for styling, `@/` alias for imports from `src`.
- Pure functions for rules; no side effects in `src/lib`.
- At most two design patterns in the codebase; prefer no pattern unless it removes a real problem.
- Keep UI layout unchanged except for the Explain button and panel.

## Test expectations
- Baseline: 88 tests pass in 5 files; typecheck, build and lint succeed.
- A bug fix needs a regression test that fails before the fix and passes after it.
- Never change acceptance criteria, rule values or test fixtures to make a test pass.
- Report real command output. Never claim a test passed without running it.

## Forbidden actions
- No `git push`, deploys, or secrets.
- No new dependencies. No `npm audit fix --force` (it installs vitest 5.x, a breaking change).
- No changes to `src/components/ResultCard.tsx`.
- No temporary files left in the repo (remove them after use).
- Do not delete or rewrite `AGENTS.md` or `README.md` without human approval.

## Approved exceptions (human approval required, each one time)
- E1 (mitigation M1): `src/lib/availability.ts` may get a finite-number guard, plus one matching line in `REASON_MAPPINGS` in `src/lib/llm/explain.ts`, plus regression tests. No other rule changes.
- E2 (mitigation M2): `@supabase/supabase-js` may be removed from `package.json` and `package-lock.json` (it is unused). Nothing else in dependencies.

## Tool disclosure
Bolt.new is not guaranteed to load this file automatically. It reads `.bolt/prompt`. Whether `AGENTS.md` is loaded was not verified, so every prompt tells the agent to read `AGENTS.md` first.

## Review gate
Every change is proposed as a diff first. A human reviews it before it is applied, and the checks in "Safe commands" are run and reported.
