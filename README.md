# Precision Arena MVP Kickoff

This repository now includes the first end-to-end MVP slice:
- Shared scoring core
- Firebase `round_submit` API
- Expo app wired to core and API
- Analytics event schema and local logger

## Included
- Accuracy calculation against template shapes (`circle`, `triangle`, `square`)
- Star mapping (`70/85/95` thresholds)
- XP formula (`accuracy * difficulty + streak bonus`)
- Basic anti-cheat payload checks
- Cloud Function endpoint (`round_submit`)
- Expo app drawing canvas with touch capture, local score, and server submit
- Analytics schema (`round_completed`, `session_started`, `session_ended`, `ad_shown`, `premium_purchased`)
- Firestore security rules and index definitions

## Structure
- `src/core/scoring.ts`: accuracy, stars, XP, round scoring
- `src/core/antiCheat.ts`: payload and timing sanity checks
- `src/core/analytics.ts`: shared analytics event types/builders
- `src/core/shapeTemplates.ts`: starter templates
- `src/demo/run.ts`: runnable smoke demo
- `functions/src/index.js`: Firebase Functions API
- `firestore.rules`: Firestore read/write access policy
- `firestore.indexes.json`: Firestore compound indexes
- `app/App.tsx`: Expo MVP screen
- `app/src/components/DrawingCanvas.tsx`: touch-based stroke capture and rendering
- `app/src/api.ts`: app-to-function request helpers
- `app/src/analytics.ts`: app-side analytics logger placeholder

## Run Core Demo
```bash
npm install
npm run start
```

## Run Scoring Benchmark (v1 vs v2)
```bash
npm run benchmark:scoring
```

## Run Backend (Firebase Functions)
```bash
npm run functions:install
npm run build
npm run functions:serve
```

## Run Mobile App (Expo)
```bash
npm run app:install
npm run app:start

```

Set `app/.env` from `app/.env.example` and provide `EXPO_PUBLIC_ROUND_SUBMIT_URL`.
Optional flags:
- `EXPO_PUBLIC_SCORING_VERSION=v1|v2`
- `EXPO_PUBLIC_ANALYTICS_INGEST_URL=https://<region>-<project-id>.cloudfunctions.net/analytics_ingest`
- `EXPO_PUBLIC_FEATURE_REWARDED_ADS=true|false`
- `EXPO_PUBLIC_REWARDED_AD_COOLDOWN_MS=90000`
- `EXPO_PUBLIC_REWARDED_AD_MAX_PER_SESSION=3`
- `EXPO_PUBLIC_FEATURE_PREMIUM=true|false`
- `EXPO_PUBLIC_FEATURE_CRASHLYTICS=true|false`
- `EXPO_PUBLIC_QUEST_CLAIM_URL=https://<region>-<project-id>.cloudfunctions.net/quest_claim`
- `EXPO_PUBLIC_PURCHASE_VERIFY_URL=https://<region>-<project-id>.cloudfunctions.net/purchase_verify`
- `EXPO_PUBLIC_ENTITLEMENT_SYNC_URL=https://<region>-<project-id>.cloudfunctions.net/entitlement_sync`
- `PRECISION_SCORING_VERSION=v1|v2` (for Cloud Functions runtime)

Functions purchase verification provider options:
- `PURCHASE_VERIFY_PROVIDER_ANDROID=mock|webhook`
- `PURCHASE_VERIFY_PROVIDER_IOS=mock|webhook`
- `PURCHASE_VERIFY_WEBHOOK_ANDROID_URL=<https-endpoint>`
- `PURCHASE_VERIFY_WEBHOOK_ANDROID_SECRET=<secret>`
- `PURCHASE_VERIFY_WEBHOOK_IOS_URL=<https-endpoint>`
- `PURCHASE_VERIFY_WEBHOOK_IOS_SECRET=<secret>`

When `webhook` provider is active, Functions sends signed headers:
- `x-provider-timestamp`
- `x-provider-signature` (`v1=` HMAC-SHA256 over `<timestamp>.<raw-body>`)

Note: Firebase Crashlytics requires a native/dev build (Expo Go does not provide the native module).

## Release iOS + Android (Single Codebase)
Run commands from `app/` directory:

```bash
npm install
npx eas login
npx eas build:configure
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
npx eas submit --platform ios --profile production --latest
npx eas submit --platform android --profile production --latest
```

For JS-only changes after release:

```bash
npx eas update --branch production --message "your update message"
```

## Notes
- Functions currently import scoring logic from `dist/index.js`, so run `npm run build` before starting emulators/deploy.
- `firebase.json` and `.firebaserc.example` are included for emulator/project setup.
- Firestore rules deny direct writes to `events`; only backend function writes events.
