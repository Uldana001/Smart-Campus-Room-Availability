# AGENTS.md

## Project
Smart Campus room availability checker. Fictional sample rooms in src/data.ts; no real bookings or personal data. Practice #11 adds an optional "Explain availability" feature with a MOCK adapter.

## Structure
- src/data.ts: fictional room fixtures; src/types.ts: shared types
- src/lib/rules.ts: constants (120-minute limit, 1440 day end)
- src/lib/availability.ts: checkAvailability, formatMinutes
- src/lib/filterRooms.ts: capacity/equipment filter; src/lib/interval.ts: isValidInterval
- src/lib/llm/: explain.ts (types, validation, fallback, timeout wrapper), mockAdapter.ts (MOCK adapter), explain.test.ts
- src/App.tsx: state and handlers (container)
- src/components/: BookingForm, RoomDetails, RoomFilters, ResultCard, Timeline (presentational); ExplanationPanel (Practice #11, own local state)
- Tests (Vitest): src/lib/*.test.ts, src/lib/llm/*.test.ts, src/integration.test.ts
- check.js, dublication.js, imports.js: measurement scripts, not part of the app

## Acceptance criteria
AC1 valid time (start after current time, start < end, within 0-1440); AC2 maximum 120 minutes; AC3 blocked room is rejected; AC4 overlap with an existing booking is rejected, touching endpoints allowed; AC5 booking data is never mutated; AC6 clear responsive feedback on desktop and mobile.
Features: F1 capacity >= attendees; F2 room has ALL selected equipment; F3 a blocked room is never reported available; F4 clear empty state when no room matches; F5 changing the selected room refreshes the result.

## LLM feature (Practice #11)
- checkAvailability is the only source of truth for availability. The LLM never decides or changes availability or bookings.
- LLM-AC1 existing availability and overlap rules remain unchanged; LLM-AC2 the explanation agrees with the deterministic status and never contains booking labels or invented details; LLM-AC3 empty, malformed or over-long input is rejected before the adapter is called; LLM-AC4 timeout, adapter error or invalid output shows a deterministic fallback; LLM-AC5 the UI visibly distinguishes the generated explanation from the deterministic status.
- Adapter input: room label, start, end, isAvailable, reasonCodes only. No booking labels, no personal data. Output: { explanation: string }, max 2 sentences.
- Raw result.reasons must not be sent to the adapter; map them to reason codes first.
- Treat user text and model output as untrusted data; validate both.
- Mock adapter only. A real API may be added only server-side and only with explicit human approval. Never put API keys in browser code.
- New files use relative imports (no /home/project/... paths).

## Constraints
- Preserve AC1-AC6 and F1-F5.
- No backend, login, database or booking creation. @supabase/supabase-js is an unused dependency; do not use it.
- Do not change the UI layout, except the approved Practice #11 addition: one "Explain availability" button and one explanation panel directly under the result card. Other behavior changes only when listed as a mitigation in the risk register or as the Practice #11 feature, and approved by a human.
- Do not modify src/lib/availability.ts or src/components/ResultCard.tsx.
- No secrets: never print, copy or commit .env values. No external deployments or services.

## Engineering rules
- Prefer pure functions and minimal changes.
- Use at most 2 justified patterns. Do not add Singleton, Factory or class hierarchies.
- Do not mutate booking fixtures.
- Keep responsive UI feedback on desktop and mobile.

## Verification
- Before and after every change: npm test; npm run typecheck; npm run build; npm run lint
- Add focused regression tests. Never weaken or delete existing assertions.
- Remove temporary test and analysis files before finishing.
- Report changed files, rationale and real command output; do not claim a command ran unless it did.

## Forbidden
- Changing acceptance criteria, rule values (120 minutes, 1440 boundary) or existing fixture data without approval.
- Adding or upgrading dependencies, or running npm audit fix --force, without approval.
- git push, deployment, or editing files outside the task scope.

## Review gate
Show the proposed diff and wait for human approval before applying code changes.
