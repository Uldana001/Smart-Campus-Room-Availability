# Smart Campus Room Availability — Assignment #04

React + TypeScript + Vite app: room catalog (6 fictional rooms), filters (capacity, equipment), availability checker.

## Setup
```
npm install
```
## Run
```
npm run dev
```
## Test
```
npm test        # runs: vitest run
```
Expected: 4 test files, 33 tests passed.
Note: vitest is pinned to 2.1.9 (the latest vitest requires a newer Vite than 5.4.21 used here).

## Structure
- `src/data.ts` — fictional room data (6 rooms, equipment, bookings)
- `src/types.ts` — shared types
- `src/lib/rules.ts` — constants (120-minute limit, 1440-minute day)
- `src/lib/availability.ts` — `checkAvailability`, `formatMinutes`
- `src/lib/filterRooms.ts` — F1/F2 filtering (pure)
- `src/lib/interval.ts` — `isValidInterval` (pure)
- `src/App.tsx` — container (state and handlers)
- `src/components/` — BookingForm, RoomDetails, RoomFilters, ResultCard, Timeline (presentational)
- Tests: `src/lib/*.test.ts`, `src/integration.test.ts`

## Measurement scripts (run with node from the project root)
```
node check.js        # line counts per file
node dublication.js  # duplicated-logic pattern counts
node imports.js      # import graph
```

## Known limitations
- UI verified manually; no component tests.
- Blocked-badge rendering (6 places) and timeline bar markup (2 places) are still duplicated.
- Refactor redistributed responsibilities; total code grew (556 → 834 lines).

## AI assistants
Bolt.new (code changes), Claude (review and report). See the report appendix.
