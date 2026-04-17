# Async Duel Prototype (Post-MVP #16 Start)

Date: 2026-03-05
Status: Started

Implemented in core:
- Duel config model (`createDuelConfig`)
- Async duel resolution function (`resolveAsyncDuel`)
- Winner calculation based on accuracy + stars-weighted score
- Scoring-version aware duel evaluation (`v1`/`v2`)

Files:
- `src/core/duel.ts`
- `src/demo/duel.ts`
- `src/index.ts` (export)
- `package.json` script: `demo:duel`

How to run:
```bash
npm run demo:duel
```

Next iteration:
- Add backend duel lifecycle endpoints (`create`, `submit_turn`, `resolve`).
- Add anti-cheat checks and timeout window per duel turn.
- Add app UI for async challenge inbox/outbox.
