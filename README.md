# Smart Campus Room Availability

A small front-end app that checks whether a campus room can be booked for a requested time interval. A deterministic availability function (`checkAvailability`) is the single source of truth: it validates the interval (start after the current time, start before end, within the 0–1440 minute day), enforces the 120-minute maximum duration, rejects blocked rooms, and rejects overlaps with existing bookings while allowing touching intervals. An optional "Explain availability" feature describes the decision in plain language using a deterministic mock adapter — no real LLM, no network calls, and the explanation never changes the availability decision.

## Setup

```bash
npm install
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the production bundle into `dist/`. |
| `npm run lint` | Runs ESLint over the project. |
| `npm run preview` | Serves the production build locally. |
| `npm run typecheck` | Type-checks the app TypeScript config (`tsc --noEmit`). |
| `npm test` | Runs the Vitest test suite once. |

## Project structure

- `src/App.tsx` — UI state, input parsing, calls the availability check.
- `src/components/` — BookingForm, ResultCard, RoomDetails, RoomFilters, Timeline, ExplanationPanel.
- `src/lib/` — availability rules (source of truth), interval and filter helpers, and `src/lib/llm/` with the explanation logic and mock adapter.
- `src/data.ts` — in-memory fictional room fixtures. No backend, no login, no database.

## Acceptance criteria

- **AC1**: a valid request has start after the current time, start < end, and times within 0–1440.
- **AC2**: maximum booking duration is 120 minutes.
- **AC3**: a blocked room is rejected.
- **AC4**: overlap with an existing booking is rejected; touching intervals are allowed.
- **AC5**: availability checks never mutate booking data.
- **AC6**: the UI gives clear, responsive feedback.

## Known limitations

- The explanation feature uses a mock adapter only — there is no real LLM or API behind it.
- No backend: all data is in-memory sample data and nothing is persisted.
- `npm audit` currently reports 25 findings; do **not** run `npm audit fix --force` (it installs a breaking vitest upgrade).
- No CI pipeline; tests and checks are run locally.

See [AGENTS.md](./AGENTS.md) for contributor rules, conventions and the review process.
