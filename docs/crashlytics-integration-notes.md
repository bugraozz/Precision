# Crashlytics Integration Notes

Date: 2026-03-05
Status: Integrated (dev-build/native)

Changes:
- Added dependencies:
  - `@react-native-firebase/app`
  - `@react-native-firebase/crashlytics`
- Added Expo plugins in `app/app.json`:
  - `@react-native-firebase/app`
  - `@react-native-firebase/crashlytics`
- App instrumentation now bridges to Crashlytics SDK when native module exists.
- Analytics crash/perf events are still emitted to backend ingestion as a parallel channel.

Runtime flag:
- `EXPO_PUBLIC_FEATURE_CRASHLYTICS=true|false`

Important:
- Crashlytics native module is not available in Expo Go.
- Use Android/iOS dev build or production build for real SDK reporting.
