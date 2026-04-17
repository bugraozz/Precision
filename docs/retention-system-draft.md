# Retention System Draft (Campaign + LiveOps)

## Scope
This draft defines the progression system implemented in app state and UI to improve long-term retention.

## Implemented Layers

1. Campaign Chapters
- Chapters are defined in `app/src/levels.ts` via `CHAPTERS`.
- Each chapter has `requiredStars` gate.
- Levels carry `chapterId` and `modeHint` (`free` or `trace`).
- Unlock check is star-based with chapter-gate validation.

2. Mastery Tracks
- Tracks: `curve`, `corner`, `memory`.
- Stored in `ProgressionState.masteryXpByTrack`.
- XP gain per round is derived from shape type + round quality.
- Exposed as derived levels via `getMasteryLevels`.

3. Daily + Weekly Quest Boards
- Daily board rotates by UTC date key.
- Weekly board rotates by week start key.
- Quest types:
  - `rounds_played`
  - `stars_earned`
  - `xp_earned`
  - `shape_rounds`
  - `high_accuracy_rounds`
- Auto-completion grants coins on first completion.

4. Live Event Progress
- Stored as `eventProgress` with `activeEventId`, `points`, milestones.
- Points are earned each round from stars + accuracy.

5. Season Progress
- Stored as `seasonProgress` with `seasonId` and `seasonXp`.
- Tier calculation is local: `getSeasonTier`.

## Storage Model
`app/src/progression.ts` now persists:
- `coins`
- `masteryXpByTrack`
- `dailyBoard`
- `weeklyBoard`
- `eventProgress`
- `seasonProgress`

Backward compatibility:
- `sanitizeProgression` keeps old saves valid and merges defaults.

## App Integration

Home screen (`app/App.tsx`) now includes:
- Chapter chips with lock states
- Chapter-filtered level list
- Mastery summary card
- Daily/weekly completion summary card
- Live event summary card

Game/Complete flow remains:
- Home -> Play -> Complete
- Progression updates on scoring submit

## Next Production Steps

1. Remote-config all gates/rewards
- Chapter star requirements
- Quest targets/rewards
- Event point formulas

2. Backend sync for anti-cheat and cloud save
- Mirror quest/event updates on server
- Signed rewards claim endpoints are now implemented in Functions:
  - `quest_claim` (daily/weekly quest reward)
  - `season_claim` (season tier reward)
- `round_submit` now updates server-side progression counters (`daily`, `weekly`, `season`) under `users/{userId}.progression`.

3. Season pass content
- Free/premium reward tracks
- Tier reward claim states

4. Notifications
- Daily reset reminder
- Event ending reminder
- Chapter unlock push
