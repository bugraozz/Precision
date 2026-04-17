# Precision Arena Implementation Plan

Last updated: 2026-03-05
Owner: Solo developer
Execution mode: Sequential (one stream), feature flags where needed

## 1. Current Baseline (Completed)
- [x] Shared core scoring package (`accuracy`, `stars`, `xp`, anti-cheat baseline)
- [x] Firebase Cloud Function `round_submit`
- [x] Firestore rules + indexes
- [x] Expo app scaffold and shared-core integration
- [x] Touch drawing canvas (stroke capture + local score + server submit)
- [x] Analytics schema base (`round_completed`, session/ad/purchase event types)

## 2. Execution Rules
- Build gate: pass `npm run build` before backend/app changes are considered done.
- Type gate: app TS check must pass (`tsc --noEmit` under `app`).
- API gate: function entry must load without crash.
- Each step below must produce a verifiable output before moving to next step.

## 3. Next Work Queue (Strict Order)

### Phase A - Quality and Safety Hardening
1. Firestore rules emulator tests
- Add test suite for `users` read/update ownership and `events` write denial.
- Verify authenticated owner access and unauthorized rejection paths.
- Output: passing emulator tests + short test matrix doc.

2. `round_submit` contract tests
- Add request/response tests for valid payload, missing fields, rejected payload, and success path.
- Include edge cases: very short round, insufficient points, invalid coordinates.
- Output: deterministic contract test results + sample payload fixtures.

3. Server/client score consistency check
- Create fixture replay tests where same points are scored locally and via function wrapper.
- Ensure score drift is within tolerance.
- Output: consistency report with max drift.

### Phase B - Gameplay Fidelity Improvements
4. [x] Shape overlay and result comparison UI (done 2026-03-05)
- Render target template overlay + user stroke overlay on result card.
- Show accuracy and mean deviation visually.
- Output: post-round feedback screen in app.

5. [x] Stroke smoothing and point reduction (done 2026-03-05)
- Add smoothing (light moving average or Catmull-Rom resampling) and point decimation.
- Keep anti-cheat checks aligned with processed point stream.
- Output: smoother drawing feel without score inflation.

6. [x] Rotation/translation-tolerant shape fit (core scoring v2) (done 2026-03-05)
- Upgrade matching beyond current normalized path pairing.
- Add optional alignment step to improve fair scoring across draw direction/orientation.
- Output: v2 scoring function behind feature flag and benchmark comparison.

### Phase C - Progression Content and UX
7. [x] Basic progression data model (done 2026-03-05)
- Add local progression state: stars per level, unlocked levels, cumulative XP.
- Persist with local storage first.
- Output: progression survives app restarts.

8. [x] Level pack v1 (10 levels) (done 2026-03-05)
- Define level config (shape, difficulty, time limit, thresholds).
- Integrate simple level select + lock logic.
- Output: playable 10-level loop.

9. [x] UX polish: tutorial + retry loop (done 2026-03-05)
- Add first-run tutorial and low-friction retry/next actions.
- Output: first-session flow from tutorial to level completion.

### Phase D - Telemetry and Monetization V1
10. [x] Analytics pipeline wiring (done 2026-03-05)
- Persist app analytics events through backend ingestion endpoint.
- Validate schema versions and required fields.
- Output: queryable events in Firestore/BigQuery-ready format.

11. [x] Rewarded ad integration (optional) (done 2026-03-05)
- Add ad placement only for extra attempt/retry reward.
- Add ad frequency guardrails.
- Output: ad flow behind remote config flag.

12. [x] Premium unlock (no-ads) (done 2026-03-05)
- Add simple premium entitlement flag and no-ads behavior.
- Keep implementation minimal (single product).
- Output: premium path testable in sandbox.

### Phase E - Release Readiness
13. [x] Crash/performance instrumentation (Crashlytics-integrated, done 2026-03-05)
- Add Crashlytics + startup/perf markers.
- Track frame stability around drawing and result screen.
- Output: crash and perf dashboards active.

14. [x] Compliance and store assets checklist (baseline draft, done 2026-03-05)
- Privacy policy, age language, skill-based wording, ad disclosures.
- Store listing assets and metadata.
- Output: submission checklist complete.

15. [x] Soft launch pack (runbook draft, done 2026-03-05)
- Country-limited rollout config, KPI dashboard snapshot, rollback plan.
- Output: launch-ready runbook.

## Design Principles
- **Levels are personal.** Level scores, stars, and results are strictly single-player. No sharing, no social comparison, no leaderboard for levels. The user plays levels for their own improvement.
- **Competition lives in Ranked/Challenge only.** All multiplayer, sharing, leaderboard, and social features belong to the Rank/Duel system. Score comparison, matchmaking, and public standings are exclusive to this mode.

## 4. Post-MVP Backlog (After KPI Gate)
16. [x] Ranked duel prototype (async first, then real-time) (async prototype started 2026-03-05)
17. Tier/rank progression and anti-smurf controls
18. Seasonal content system and pass
19. Extended modes (blind/mirror/memory/trace)

## 5. KPI Gate Before Competitive Features
- D1 >= 20%
- D7 >= 8%
- Crash-free sessions >= 99%
- Baseline premium conversion >= 1%
- If gates fail: iterate single-player loop before ranked/season development.

## 6. Immediate Next 3 Steps (when you say continue)
1. Collect and fill external compliance evidence (`docs/compliance-evidence.md`) for real policy URLs and store assets.
2. Add backend async duel lifecycle endpoints (`create`, `submit_turn`, `resolve`).
3. Add app UI shell for async challenge inbox/outbox.
