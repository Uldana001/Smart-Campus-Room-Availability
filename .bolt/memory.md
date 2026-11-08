# Project memory

## Product intent & audience

- One-page responsive web app for checking campus room availability using time intervals and validation rules
- Uses fictional sample data (no real backend/integration)
- Audience: students/staff needing quick room availability info on campus

## Brand personality & voice

- Utility-focused; likely needs clarity, speed, and trust in results
- Smart/campus-oriented — clean, modern, approachable

## Visual design & UX direction

- Vite + React + Tailwind CSS + lucide-react icons (per `.bolt/prompt`)
- One-page layout; responsive (mobile → desktop)
- Likely components: time interval picker, validation feedback, availability results list/grid
- Prefer production-quality, non-cookie-cutter aesthetics (per `.bolt/prompt`); avoid generic template look
- Use `@/` path alias for imports (per `.bolt/prompt`)
- No additional UI/theme packages unless explicitly requested

## Decisions, constraints & rationale

- Fictional sample data only — no live data sources
- Validation rules central to feature; must be clearly communicated to users
- Single page — no routing/multi-page navigation required

## Open questions & assumptions

- Exact validation rules not yet specified (assumes time overlap/interval conflict checks)
- Data schema for rooms/reservations not yet defined
- Visual style details (colors, typography) still undefined — await direction or infer from campus/education conventions