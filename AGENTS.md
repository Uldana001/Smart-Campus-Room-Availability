# AGENTS.md

## Project
Smart Campus room availability checker; one room, fictional data.

## Structure
- src/lib/availability.ts: pure booking rule (checkAvailability, formatMinutes)
- src/lib/checkAvailability.test.ts: regression tests (Vitest)
- src/App.tsx, src/components/ResultCard.tsx, src/components/Timeline.tsx: UI
- src/data.ts: fictional fixtures
- src/types.ts: shared types

## Constraints
- Preserve AC1–AC6.
- No backend, login, database or booking creation.
- Do not change the existing UI layout or behavior.

## Engineering rules
- Prefer pure functions and minimal changes.
- Use at most 2 justified patterns. Do not add Singleton, Factory or class hierarchies.
- Do not mutate booking fixtures.
- Keep responsive UI feedback on desktop and mobile.

## Verification
- Run tests with: npx vitest run
- Run existing tests before and after every change; add focused regression tests.
- Never weaken or delete existing assertions.
- Report changed files, rationale and test evidence.

## Forbidden
- Changing acceptance criteria, rule values (120 minutes, 1440 boundary) or fixture data.