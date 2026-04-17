const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { verifyPurchase, normalizeProviderResult, createWebhookSignature } = require("../src/purchaseProviders");

const requestFixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "purchase-verify-webhook.request.json"), "utf8")
);
const responseFixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "purchase-verify-webhook.response.json"), "utf8")
);

async function runCase(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
}

async function main() {
  await runCase("mock provider accepts sandbox payload", async () => {
    const result = await verifyPurchase(
      {
        ...requestFixture,
        sandbox: true,
        purchaseToken: undefined
      },
      {
        PURCHASE_VERIFY_PROVIDER_ANDROID: "mock"
      }
    );

    assert.equal(result.valid, true);
    assert.equal(result.reason, "ok");
  });

  await runCase("mock provider rejects missing proof outside sandbox", async () => {
    const result = await verifyPurchase(
      {
        userId: "u1",
        productId: "premium.bundle.v1",
        platform: "android",
        sandbox: false
      },
      {
        PURCHASE_VERIFY_PROVIDER_ANDROID: "mock"
      }
    );

    assert.equal(result.valid, false);
    assert.equal(result.reason, "missing_purchase_proof");
  });

  await runCase("webhook provider forwards payload and normalizes response", async () => {
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        async json() {
          return responseFixture;
        }
      };
    };

    try {
      const result = await verifyPurchase(requestFixture, {
        PURCHASE_VERIFY_PROVIDER_ANDROID: "webhook",
        PURCHASE_VERIFY_WEBHOOK_ANDROID_URL: "https://verifier.example/verify",
        PURCHASE_VERIFY_WEBHOOK_ANDROID_SECRET: "test-secret"
      });

      assert.equal(result.valid, true);
      assert.equal(result.transactionId, "txn_test_123");
      assert.equal(result.expiresAtMs, 1767225600000);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, "https://verifier.example/verify");
      assert.equal(calls[0].options.method, "POST");
      assert.equal(typeof calls[0].options.headers["x-provider-timestamp"], "string");
      assert.equal(typeof calls[0].options.headers["x-provider-signature"], "string");
      assert.ok(calls[0].options.headers["x-provider-signature"].startsWith("v1="));
      assert.equal(typeof calls[0].options.body, "string");
    } finally {
      global.fetch = originalFetch;
    }
  });

  await runCase("createWebhookSignature produces deterministic v1 signature", async () => {
    const payloadJson = JSON.stringify({ hello: "world" });
    const sig1 = createWebhookSignature("secret", payloadJson, 1700000000);
    const sig2 = createWebhookSignature("secret", payloadJson, 1700000000);

    assert.equal(sig1.timestampSec, 1700000000);
    assert.equal(sig1.signature, sig2.signature);
    assert.ok(sig1.signature.startsWith("v1="));
  });

  await runCase("normalizeProviderResult handles invalid object", async () => {
    const result = normalizeProviderResult(null);
    assert.equal(result.valid, false);
    assert.equal(result.reason, "provider_invalid_response");
  });
}

main().catch((error) => {
  console.error("FAIL purchase provider contract tests");
  console.error(error);
  process.exit(1);
});
