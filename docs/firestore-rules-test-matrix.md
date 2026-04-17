# Firestore Rules Test Matrix

Date: 2026-03-05
Scope: `firestore.rules`
Runner: `npm run test:firestore-rules --prefix functions`

| Case | Actor | Target | Operation | Expected | Status |
| --- | --- | --- | --- | --- | --- |
| users owner read | `auth.uid = user_1` | `users/user_1` | `get` | allow | passing |
| users owner update allowed keys | `auth.uid = user_1` | `users/user_1` | `update` `totals/updatedAt` | allow | passing |
| users owner update disallowed key | `auth.uid = user_1` | `users/user_1` | `update` `rank` | deny | passing |
| users non-owner read | `auth.uid = user_2` | `users/user_1` | `get` | deny | passing |
| users non-owner update | `auth.uid = user_2` | `users/user_1` | `update` | deny | passing |
| events create (client) | `auth.uid = user_1` | `events/evt_1` | `create` | deny | passing |

Notes:
- `events` writes are intentionally denied for clients; backend function writes via Admin SDK bypass rules.
- Rules are loaded directly from root file `firestore.rules` during test startup.
