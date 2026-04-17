# TODO - Next Session (2026-03-07)

## Priority Order
1. Claim reward flow fix (daily/weekly)
2. Main/Home UI redesign
3. Collection equip UI redesign
4. Premium value proposition expansion
5. Global button system polish
6. Background color/layer redesign

## 1) Claim Reward Flow Fix (Critical)
- Status (2026-03-06): Completed
- Implemented:
  - Claim responses are normalized in one app-side function before state merge.
  - Daily/weekly claim buttons now show immediate pending state (`Claiming...`) and avoid duplicate taps.
  - Added safe local fallback for claim when backend progression lags behind local progression (`quest_not_completed`, `tier_locked`, etc.), so eligible local quests/tiers do not stay stuck at `Claim`.
  - Closed duplicate-reward gap:
    - Added in-flight claim lock to quest/streak actions.
    - `already_claimed` now syncs local claimed flag without granting extra coin.
  - Guardrail kept: if backend `accepted=false`, no local coin/gem/claimed update is applied.
  - Claim feedback strengthened: coin card pulse + persistent `Claimed +X` summary.
  - Added coin utility sinks:
    - `120 coins -> up to 3 energy refill` from Home panel.
    - `80 coins -> 1 retry token` purchase + complete-screen instant retry consumption.
  - Daily/weekly claims now support random quest pools; unknown backend quest ids fallback to local claim (`unknown_quest`).

## Daily/Weekly Pool Update (2026-03-06)
- Daily and weekly missions are now pool-based and deterministic-random by date key:
  - Daily: 3 quests selected from `DAILY_QUEST_POOL` by `dayKey`.
  - Weekly: 5 quests + 1 catch-up selected from weekly pools by `weekKey`.
- Progress updates are now metric-driven (`rounds`, `stars`, `xp`, `twoPlusStars`, `bossAttempts`, `highAccuracy`, `ladderPoints`) instead of fixed quest-id logic.
- Season panel and season claim flow removed from app UI. Mission system now focuses on daily + weekly only.
- Backend season claim endpoint deprecated and removed (`functions/src/index.js`); claims contract tests now cover daily/weekly quest flows only.
- Backend sync complete: `functions/src/index.js` now uses the same deterministic pool selection by board key for claim validation, preventing app/backend quest-id drift.
- Problem:
  - Daily/weekly gorevleri tamamlanip Claim'e basildiginda odul etkisi tutarsiz veya gorunmez.
  - Kullanici acisindan claim anlamsiz hissediliyor.
- Tasks:
  - Claim endpoint yanitlarini app tarafinda tek yerde normalize et (accepted/reason/reward fields).
  - Claim sonrasi state merge adimini garantiye al:
    - coin/gem artisi
    - claimed flag
    - disabled state update
  - UI feedback'i guclendir:
    - anlik "Claimed +X" mesaji
    - coin kartinda sayisal artisi belirgin goster
    - claim butonu state'ini aninda "Claimed" yap
  - Daily/weekly claim flow'unu tek tek smoke test et.
  - Mismatch durumlari icin guard ekle (backend accepted false ise yerel update yapma).
- Done criteria: 
  - Claim butonuna basinca odul her seferinde net yansiyor.
  - Coin/gem ve claimed state UI'da aninda guncelleniyor.
  - Daily ve weekly flow'larda regresyon yok.

## 2) Main/Home UI Redesign (High)
- Status (2026-03-06): Completed
- Addendum (2026-03-06): Level selector cards now show mechanic-specific pressure hints and accent styles.
- Addendum (2026-03-06): Chapter levels now use explicit chapter mechanic plans + per-level `focusHint`, and UI surfaces this as `Focus: ...` in selector, mission card, and play pressure panel.
- Addendum (2026-03-06): Mechanic pressure calibrated with staged penalties:
  - Speed: par ratio `0.68`, heavy penalty after `par * 1.05` + live countdown/overtime warning in play UI.
  - Stability: wobble warn `0.72`, heavy `0.86`.
  - Symmetry: accuracy warn `<90%`, heavy `<84%`.
- Problem:
  - Current home/main visual hierarchy is weak.
  - Sections feel crowded and not premium enough.
- Tasks:
  - Rebuild hero area (clear title, economy summary, active premium state).
  - Re-layout panel navigation (overview/daily/weekly/collection) with stronger visual separation.
  - Introduce card grouping and spacing system (consistent paddings, gap scale, card elevation tiers).
  - Add cleaner information density rules (show top KPIs first, move secondary stats into expandable cards).
- Done criteria:
  - Home is readable in first 3 seconds.
  - No overcrowded blocks.
  - Premium aesthetic is consistent with rest of app.

## 3) Collection Selection UI Redesign (High)
- Status (2026-03-06): Completed
- Problem:
  - Current collection/equip area is functional but visually weak.
- Tasks:
  - Convert slot sections (Brush/Trail/Frame) into clear premium inventory modules.
  - Add item cards with:
    - name
    - rarity badge
    - slot icon
    - preview chip
    - equip state badge
  - Improve equipped state visibility ("Equipped" should be immediately obvious).
  - Add compact live preview area for current loadout.
- Done criteria:
  - User can identify equipped brush/trail/frame at a glance.
  - Inventory visually looks like premium catalog, not debug list.

## 4) Premium Offering Expansion (High)
- Status (2026-03-06): Completed
- Problem:
  - Premium conversion proposition is still too basic.
- Tasks:
  - Define and surface richer premium feature bundle in UI:
    - 3x daily energy
    - no ads
    - premium cosmetic set
    - monthly exclusive item
    - premium badge/profile flair
    - optional premium quests/reward multiplier (design decision)
  - Rework premium card/paywall section messaging:
    - stronger value copy
    - clearer comparison Free vs Premium
    - better CTA hierarchy
  - Add premium feature bullets with icons.
- Done criteria:
  - Premium offer looks materially better than Free.
  - User can understand why to buy in under 10 seconds.

## 5) Global Button System Polish (Medium)
- Status (2026-03-06): Completed
- Problem:
  - Button styles/interactions are not fully standardized across all screens.
- Tasks:
  - Standardize button variants:
    - primary
    - secondary
    - ghost
    - reward/claim
    - danger (if needed)
  - Ensure consistent:
    - radius
    - height
    - font weights
    - press feedback
    - disabled states
  - Verify all screens use same interaction language.
- Done criteria:
  - Buttons feel consistent app-wide.
  - No outlier styles remaining.

## 6) Background / Color Atmosphere Rework (Medium)
- Status (2026-03-06): Completed
- Problem:
  - Background currently looks like simple blue-black split.
- Tasks:
  - Replace flat look with layered atmosphere:
    - gradient foundation
    - subtle radial overlays
    - low-opacity shape/noise accents
  - Ensure readability/contrast remains strong.
  - Tune for both main and play/complete screens.
- Done criteria:
  - Background looks intentional and premium, not two-color flat.
  - Text contrast remains accessible.

## Optional Stretch
- Add rarity-specific item animations:
  - Epic: subtle glow
  - Legendary: animated border shimmer
  - Mythic: stronger aura + micro spark pulse

## Session Start Checklist
- Open and review:
  - `app/App.tsx`
  - `app/src/cosmetics.ts`
  - `app/src/components/LevelSelector.tsx`
  - `app/src/components/RoundComparisonCard.tsx`
  - `app/src/components/DrawingCanvas.tsx`
- Run baseline checks before edits:
  - `npx tsc --noEmit -p app/tsconfig.json`
  - `npm run build`
