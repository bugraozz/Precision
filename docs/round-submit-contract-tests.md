# round_submit Contract Test Matrix

Date: 2026-03-05
Runner: `npm run test:round-submit --prefix functions`

| Case | Input Pattern | Expected Response | Status |
| --- | --- | --- | --- |
| missing fields | body missing required keys | `400` + `error=missing_fields` + `fields[]` | passing |
| very short round | `endedAtMs - startedAtMs < 500` | `422` + `accepted=false` + `round_too_fast` | passing |
| insufficient points | points below `minimumRequiredPoints(timeLimitMs)` | `422` + `accepted=false` + `insufficient_points` | passing |
| invalid coordinates | non-finite coordinate present | `422` + `accepted=false` + `invalid_coordinates` | passing |
| success path | valid payload + transaction succeeds | `200` + score payload + `eventId` | passing |
| persistence failure | transaction throws | `500` + `error=internal_error` | passing |

Fixtures:
- Contract payload factory is in `functions/tests/round-submit.contract.test.js`.
- Score consistency sample fixtures are in `functions/tests/fixtures/score-fixtures.json`.
