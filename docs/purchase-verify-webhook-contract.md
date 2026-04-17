# Purchase Verify Webhook Contract

Tarih: 2026-03-06
Amac: `functions/src/purchaseProviders.js` icindeki `webhook` provider ile harici store verifier servisinin sozlesmesini tanimlamak.

## 1. Endpoint
- Method: `POST`
- Content-Type: `application/json`
- Optional signed headers (if secret configured):
  - `x-provider-timestamp: <unix-seconds>`
  - `x-provider-signature: v1=<hex-hmac-sha256>`

Signature base string:
- `${x-provider-timestamp}.${raw_request_body}`
- Algorithm: `HMAC-SHA256`
- Key: webhook secret (`PURCHASE_VERIFY_WEBHOOK_*_SECRET`)

## 2. Request Payload
```json
{
  "userId": "local-user",
  "productId": "premium.bundle.v1",
  "platform": "android",
  "purchaseToken": "optional-token",
  "receiptData": "optional-receipt",
  "sandbox": true
}
```

Alanlar:
- `userId` (string): uygulama kullanicisi
- `productId` (string): satin alinmis urun id
- `platform` (`android`|`ios`)
- `purchaseToken` (string, optional): Play Billing token
- `receiptData` (string, optional): App Store receipt
- `sandbox` (boolean, optional): test/sandbox modu

## 3. Response Payload
Webhook cevabi su sekilde normalize edilir:

```json
{
  "valid": true,
  "reason": "ok",
  "transactionId": "txn_123",
  "expiresAtMs": 1767225600000,
  "raw": {
    "store": "play"
  }
}
```

Alanlar:
- `valid` (boolean, required): satin alma dogrulama sonucu
- `reason` (string, optional): hata/diagnostic nedeni
- `transactionId` (string, optional): store transaction id
- `expiresAtMs` (number, optional): abonelik bitis epoch ms
- `raw` (object, optional): provider debug payload

## 4. Failure Semantics
- HTTP != 2xx: `provider_http_<status>`
- Network/exception: `provider_request_failed:<error>`
- Body invalid: `provider_invalid_response`

## 5. Security Notes
- Webhook endpoint private olmalidir.
- `x-provider-signature` dogrulanmali, timestamp drift kontrolu uygulanmalidir (onerilen max 300 sn).
- Rate-limit, replay protection ve idempotency onerilir.
- Store APIs ile server-side verify yapilmadan `valid=true` donulmemelidir.

## 6. Environment Variables
- `PURCHASE_VERIFY_PROVIDER_ANDROID=webhook`
- `PURCHASE_VERIFY_PROVIDER_IOS=webhook`
- `PURCHASE_VERIFY_WEBHOOK_ANDROID_URL=<https-endpoint>`
- `PURCHASE_VERIFY_WEBHOOK_ANDROID_SECRET=<secret>`
- `PURCHASE_VERIFY_WEBHOOK_IOS_URL=<https-endpoint>`
- `PURCHASE_VERIFY_WEBHOOK_IOS_SECRET=<secret>`
