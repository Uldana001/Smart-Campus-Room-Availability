# AGENTS.md

## Project
Smart Campus room availability checker. Fictional sample rooms in src/data.ts; no real bookings or personal data.

## Structure
- src/data.ts: fictional room fixtures; src/types.ts: shared types
- src/lib/rules.ts: constants (120-minute limit, 1440 day end)
- src/lib/availability.ts: checkAvailability, formatMinutes
- src/lib/filterRooms.ts: capacity/equipment filter; src/lib/interval.ts: isValidInterval
- src/App.tsx: state and handlers (container)
- src/components/: BookingForm, RoomDetails, RoomFilters, ResultCard, Timeline (presentational)
- Tests (Vitest): src/lib/*.test.ts, src/integration.test.ts
- check.js, dublication.js, imports.js: measurement scripts, not part of the app

## Acceptance criteria
AC1 valid time (start after current time, start < end, within 0-1440); AC2 maximum 120 minutes; AC3 blocked room is rejected; AC4 overlap with an existing booking is rejected, touching endpoints allowed; AC5 booking data is never mutated; AC6 clear responsive feedback on desktop and mobile.
Features: F1 capacity >= attendees; F2 room has ALL selected equipment; F3 a blocked room is never reported available; F4 clear empty state when no room matches; F5 changing the selected room refreshes the result.

## Constraints
- Preserve AC1-AC6 and F1-F5.
- No backend, login, database or booking creation. @supabase/supabase-js is an unused dependency; do not use it.
- Do not change the UI layout. Behavior changes only when listed as a mitigation in the risk register and approved by a human.
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
