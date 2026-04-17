# Crash and Performance Baseline

Date: 2026-03-05
Scope: App-side baseline instrumentation for MVP

Implemented:
- Startup performance marker
  - Metric name: `app_startup_ms`
  - Emitted once at app boot and sent to `analytics_ingest`.
- Global crash capture hook
  - Installs RN `ErrorUtils` global handler when available.
  - Emits `crash_report` events (`message`, `stack`, `fatal`) to analytics ingestion.
- Session lifecycle flushing
  - Session start/end events and queue flush integrated at app lifecycle boundaries.

Files:
- `app/src/instrumentation.ts`
- `app/App.tsx`
- `src/core/analytics.ts` (new event builders: `perf_marker`, `crash_report`)

Notes:
- This is a baseline and does not replace full Crashlytics integration.
- Ingestion endpoint validation now accepts `perf_marker` and `crash_report` events.
