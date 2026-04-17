# Analytics Ingest Contract Tests

Date: 2026-03-05
Runner: `npm run test:analytics-ingest --prefix functions`

| Case | Input Pattern | Expected | Status |
| --- | --- | --- | --- |
| missing events payload | body without `events[]` | `400` + `missing_events` | passing |
| unsupported schema | event `schemaVersion != 1.0` | `422` + `unsupported_schema_version` | passing |
| missing required event field | `round_completed` missing `accuracy` | `422` + `missing_fields` | passing |
| valid mixed batch | valid `round_completed` + `session_started` | `200` + accepted count + event IDs | passing |
| Firestore write failure | batch commit throws | `500` + `internal_error` | passing |

Validation guarantees:
- Base required fields: `schemaVersion`, `eventType`, `userId`, `timestamp`, `sessionId`
- Schema support: only `1.0`
- Event-type required field checks are enforced server-side before persistence.

Storage format:
- Collection: `analytics_events`
- Common query fields: `schemaVersion`, `eventType`, `userId`, `sessionId`, `eventTimestamp`, `eventDate`, `ingestedAt`
- Raw payload retained in `payload` for downstream BigQuery mapping.
