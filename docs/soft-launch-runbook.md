# Soft Launch Runbook

Date: 2026-03-05
Status: Draft baseline

## Rollout Scope
- Start with one low-risk country.
- Keep release staged and monitor 24h before expansion.

## Runtime Flags
- `EXPO_PUBLIC_FEATURE_REWARDED_ADS` default `false` for first cohort.
- `EXPO_PUBLIC_FEATURE_PREMIUM` default `true` (sandbox only in current MVP).
- `EXPO_PUBLIC_SCORING_VERSION` keep `v1` for control cohort; evaluate `v2` in limited rollout.

## KPI Snapshot Targets
- D1 >= 20%
- D7 >= 8%
- Crash-free sessions >= 99%
- Premium conversion >= 1%

## Observability Checks
- Verify `analytics_events` receives `session_started`, `round_completed`, `ad_shown`, `premium_purchased`, `perf_marker`, `crash_report`.
- Confirm `eventDate` partitioning and queryability by `eventType`.

## Rollback Plan
- Disable rewarded ads via flag if retention drops.
- Disable scoring v2 via flag if score sentiment degrades.
- Pause rollout and revert to previous app version if crash rate spikes.

## Go/No-Go Checklist
- [ ] Compliance checklist complete.
- [ ] Analytics ingestion healthy for 24h.
- [ ] No blocking crash regressions.
- [ ] Store listing text approved.
